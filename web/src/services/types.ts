import type {
  t_user,
  t_project,
  t_script,
  t_assets,
  t_video,
  t_config,
  t_outline,
  t_novel,
  t_storyline,
  t_image,
  t_videoConfig,
} from '../types/database';

// API Response wrapper
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// Auth types
export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: t_user;
}

export interface RegisterRequest {
  name: string;
  password: string;
}

// Project types
export type Project = t_project;
export type CreateProjectRequest = Omit<t_project, 'id' | 'createTime'>;
export type UpdateProjectRequest = Partial<Omit<t_project, 'id' | 'userId' | 'createTime'>>;

// Script types
export type Script = t_script;
export type CreateScriptRequest = Omit<t_script, 'id'>;
export type UpdateScriptRequest = Partial<Omit<t_script, 'id' | 'projectId'>>;

// Outline types
export type Outline = t_outline;
export type CreateOutlineRequest = Omit<t_outline, 'id'>;
export type UpdateOutlineRequest = Partial<Omit<t_outline, 'id' | 'projectId'>>;

// Novel types
export type Novel = t_novel;
export type CreateNovelRequest = Omit<t_novel, 'id' | 'createTime'>;
export type UpdateNovelRequest = Partial<Omit<t_novel, 'id' | 'projectId' | 'createTime'>>;

// Storyline types
export type Storyline = t_storyline;
export type CreateStorylineRequest = Omit<t_storyline, 'id'>;
export type UpdateStorylineRequest = Partial<Omit<t_storyline, 'id' | 'projectId'>>;

// Assets types
export type Asset = t_assets;
export type CreateAssetRequest = Omit<t_assets, 'id'>;
export type UpdateAssetRequest = Partial<Omit<t_assets, 'id' | 'projectId'>>;

// Video types
export type Video = t_video;
export type VideoConfig = t_videoConfig;
export type CreateVideoRequest = Omit<t_video, 'id' | 'time'>;
export type UpdateVideoRequest = Partial<Omit<t_video, 'id' | 'scriptId'>>;
export type CreateVideoConfigRequest = Omit<t_videoConfig, 'id' | 'createTime' | 'updateTime'>;
export type UpdateVideoConfigRequest = Partial<Omit<t_videoConfig, 'id' | 'projectId' | 'createTime' | 'updateTime'>>;

// Image types
export type Image = t_image;
export type CreateImageRequest = Omit<t_image, 'id'>;
export type UpdateImageRequest = Partial<Omit<t_image, 'id' | 'projectId'>>;

// Config types
export type Config = t_config;
export type CreateConfigRequest = Omit<t_config, 'id' | 'createTime'>;
export type UpdateConfigRequest = Partial<Omit<t_config, 'id' | 'userId' | 'createTime'>>;

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
