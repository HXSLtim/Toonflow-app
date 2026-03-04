import { useState } from 'react'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ComponentsShowcase() {
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Toonflow 组件库</h1>
          <ModeToggle />
        </div>

        <div className="space-y-8">
          {/* Alerts */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">提示</h2>
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>
                  你的更改已成功保存。
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>
                  出了点问题，请重试。
                </AlertDescription>
              </Alert>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">按钮</h2>
            <div className="flex flex-wrap gap-4">
              <Button>默认</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="destructive">危险</Button>
              <Button variant="outline">描边</Button>
              <Button variant="ghost">幽灵</Button>
              <Button variant="link">链接</Button>
              <Button size="sm">小</Button>
              <Button size="lg">大</Button>
              <Button disabled>禁用</Button>
            </div>
          </section>

          {/* Form Inputs */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">表单输入</h2>
            <Card>
              <CardHeader>
                <CardTitle>表单示例</CardTitle>
                <CardDescription>请在下方输入你的信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    placeholder="请输入姓名"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="请输入邮箱" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">消息</Label>
                  <Textarea id="message" placeholder="在此输入消息" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">角色</Label>
                  <Select>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="user">用户</SelectItem>
                      <SelectItem value="guest">访客</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => {
                  toast({
                    title: "表单已提交！",
                    description: `姓名：${inputValue || '未填写'}`,
                  })
                }}>提交</Button>
              </CardFooter>
            </Card>
          </section>

          {/* Tabs */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">标签页</h2>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">账户</TabsTrigger>
                <TabsTrigger value="password">密码</TabsTrigger>
                <TabsTrigger value="settings">设置</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>账户</CardTitle>
                    <CardDescription>
                      在这里修改你的账户信息。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="username">用户名</Label>
                      <Input id="username" defaultValue="@username" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>密码</CardTitle>
                    <CardDescription>
                      在这里修改你的密码。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="current">当前密码</Label>
                      <Input id="current" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new">新密码</Label>
                      <Input id="new" type="password" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>设置</CardTitle>
                    <CardDescription>
                      在这里管理你的设置。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">设置内容显示在这里。</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Dialog */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">对话框</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确定吗？</DialogTitle>
                  <DialogDescription>
                    此操作无法撤销。它将永久删除你的账户，并从我们的服务器移除你的数据。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">取消</Button>
                  <Button variant="destructive">删除</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>

          {/* Table */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">表格</h2>
            <Card>
              <CardHeader>
                <CardTitle>项目</CardTitle>
                <CardDescription>你的最近项目列表。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名称</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">项目甲</TableCell>
                        <TableCell>进行中</TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">项目乙</TableCell>
                        <TableCell>待处理</TableCell>
                        <TableCell>2024-02-20</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">项目丙</TableCell>
                        <TableCell>已完成</TableCell>
                        <TableCell>2024-03-01</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Toast Demo */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">消息通知</h2>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => {
                  toast({
                    title: "成功！",
                    description: "你的操作已成功完成。",
                  })
                }}
              >
                显示成功通知
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast({
                    variant: "destructive",
                    title: "错误！",
                    description: "出现错误。",
                  })
                }}
              >
                显示错误通知
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
