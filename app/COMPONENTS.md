# Toonflow UI Components 文档

## 概述

Toonflow 使用 shadcn/ui 组件库，基于 Radix UI 和 Tailwind CSS 构建。所有组件支持暗色模式和响应式设计。

## 已实现的组件

### 1. Button（按钮）

多种变体的按钮组件。

**变体**：
- `default` - 主要按钮
- `secondary` - 次要按钮
- `destructive` - 危险操作按钮
- `outline` - 轮廓按钮
- `ghost` - 幽灵按钮
- `link` - 链接样式按钮

**尺寸**：
- `default` - 默认尺寸
- `sm` - 小尺寸
- `lg` - 大尺寸
- `icon` - 图标按钮

**使用示例**：
```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button size="lg">Large Button</Button>
```

### 2. Input（输入框）

标准文本输入组件。

**使用示例**：
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
```

### 3. Textarea（文本域）

多行文本输入组件。

**使用示例**：
```tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="Type your message here" />
```

### 4. Select（选择器）

下拉选择组件。

**使用示例**：
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### 5. Card（卡片）

容器组件，用于组织内容。

**使用示例**：
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### 6. Dialog（对话框）

模态对话框组件。

**使用示例**：
```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 7. Tabs（标签页）

标签页切换组件。

**使用示例**：
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### 8. Table（表格）

数据表格组件。

**使用示例**：
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 9. Toast（通知）

轻量级通知组件。

**使用示例**：
```tsx
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Success!",
          description: "Your operation completed successfully.",
        })
      }}
    >
      Show Toast
    </Button>
  )
}
```

**错误通知**：
```tsx
toast({
  variant: "destructive",
  title: "Error!",
  description: "Something went wrong.",
})
```

### 10. Alert（警告）

警告提示组件。

**使用示例**：
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

### 11. Form（表单）

表单组件，集成 react-hook-form 和 zod 验证。

**使用示例**：
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### 12. Label（标签）

表单标签组件。

**使用示例**：
```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email</Label>
```

## 暗色模式

### 主题切换

使用 `ThemeProvider` 和 `useTheme` hook 实现暗色模式。

**设置**：
```tsx
// main.tsx
import { ThemeProvider } from '@/components/theme-provider'

<ThemeProvider defaultTheme="system" storageKey="toonflow-theme">
  <App />
</ThemeProvider>
```

**使用主题切换**：
```tsx
import { ModeToggle } from '@/components/mode-toggle'

<ModeToggle />
```

**手动控制主题**：
```tsx
import { useTheme } from '@/components/theme-provider'

function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  )
}
```

## 响应式设计

所有组件都支持响应式设计，使用 Tailwind CSS 的响应式前缀：

- `sm:` - 640px 及以上
- `md:` - 768px 及以上
- `lg:` - 1024px 及以上
- `xl:` - 1280px 及以上
- `2xl:` - 1536px 及以上

**示例**：
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

## 工具函数

### cn() - 类名合并

用于合并 Tailwind CSS 类名。

```tsx
import { cn } from '@/lib/utils'

<div className={cn("base-class", condition && "conditional-class", className)}>
  Content
</div>
```

## 图标

使用 `lucide-react` 图标库。

**使用示例**：
```tsx
import { Check, X, AlertCircle, Settings } from 'lucide-react'

<Button>
  <Check className="mr-2 h-4 w-4" />
  Confirm
</Button>
```

## 组件展示页面

访问 `/components` 路由查看所有组件的实时演示。

## 自定义主题

在 `src/index.css` 中修改 CSS 变量来自定义主题颜色：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... 更多变量 */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... 更多变量 */
}
```

## 最佳实践

1. **使用 Form 组件进行表单验证** - 集成 react-hook-form 和 zod
2. **响应式优先** - 使用移动端优先的设计方法
3. **无障碍访问** - 所有组件都支持键盘导航和屏幕阅读器
4. **一致的间距** - 使用 Tailwind 的间距系统（space-y-4, gap-4 等）
5. **语义化 HTML** - 使用正确的 HTML 标签和 ARIA 属性

## 添加新组件

如需添加更多 shadcn/ui 组件，参考官方文档：https://ui.shadcn.com/
