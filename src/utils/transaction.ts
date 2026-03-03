import { Knex } from "knex";
import { db } from "@/utils/db";

/**
 * 事务工具函数
 * 提供统一的事务处理接口，确保数据一致性
 */

/**
 * 在事务中执行回调函数
 * 自动处理提交和回滚
 *
 * @example
 * await withTransaction(async (trx) => {
 *   await trx("t_project").insert(project);
 *   await trx("t_outline").insert(outlines);
 * });
 */
export async function withTransaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
  return db.transaction(async (trx) => {
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
}

/**
 * 批量插入数据（使用事务）
 * 支持大批量数据的分批插入
 *
 * @param tableName 表名
 * @param data 要插入的数据数组
 * @param batchSize 每批次大小，默认 100
 */
export async function batchInsert<T extends Record<string, any>>(
  tableName: string,
  data: T[],
  batchSize: number = 100
): Promise<void> {
  if (data.length === 0) return;

  await withTransaction(async (trx) => {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await trx(tableName).insert(batch);
    }
  });
}

/**
 * 批量更新数据（使用事务）
 *
 * @param tableName 表名
 * @param updates 更新数组，每项包含 where 条件和 data 更新数据
 */
export async function batchUpdate<T extends Record<string, any>>(
  tableName: string,
  updates: Array<{ where: Partial<T>; data: Partial<T> }>
): Promise<void> {
  if (updates.length === 0) return;

  await withTransaction(async (trx) => {
    for (const { where, data } of updates) {
      await trx(tableName).where(where).update(data);
    }
  });
}

/**
 * 级联删除（使用事务）
 * 删除主记录及其关联记录
 *
 * @example
 * await cascadeDelete("t_project", { id: projectId }, [
 *   { table: "t_outline", foreignKey: "projectId" },
 *   { table: "t_script", foreignKey: "projectId" },
 * ]);
 */
export async function cascadeDelete(
  mainTable: string,
  where: Record<string, any>,
  relatedTables: Array<{ table: string; foreignKey: string }>
): Promise<void> {
  await withTransaction(async (trx) => {
    // 先删除关联表数据
    for (const { table, foreignKey } of relatedTables) {
      await trx(table).where({ [foreignKey]: where.id }).del();
    }

    // 最后删除主表数据
    await trx(mainTable).where(where).del();
  });
}

/**
 * 乐观锁更新
 * 使用版本号防止并发更新冲突
 *
 * @param tableName 表名
 * @param id 记录ID
 * @param version 当前版本号
 * @param data 要更新的数据
 * @returns 是否更新成功
 *
 * @example
 * const success = await optimisticUpdate("t_script", scriptId, currentVersion, {
 *   content: newContent
 * });
 * if (!success) {
 *   throw new Error("数据已被其他用户修改，请刷新后重试");
 * }
 */
export async function optimisticUpdate<T extends Record<string, any>>(
  tableName: string,
  id: number,
  version: number,
  data: Partial<T>
): Promise<boolean> {
  const updated = await db(tableName)
    .where({ id, version })
    .update({
      ...data,
      version: version + 1,
      updateTime: Date.now(),
    });

  return updated > 0;
}

/**
 * 安全删除（软删除）
 * 不真正删除数据，而是标记为已删除
 *
 * @param tableName 表名
 * @param where 删除条件
 */
export async function softDelete(tableName: string, where: Record<string, any>): Promise<void> {
  await db(tableName).where(where).update({
    state: "deleted",
    updateTime: Date.now(),
  });
}

/**
 * 恢复软删除的数据
 *
 * @param tableName 表名
 * @param where 恢复条件
 */
export async function restoreSoftDeleted(tableName: string, where: Record<string, any>): Promise<void> {
  await db(tableName)
    .where(where)
    .andWhere({ state: "deleted" })
    .update({
      state: "active",
      updateTime: Date.now(),
    });
}
