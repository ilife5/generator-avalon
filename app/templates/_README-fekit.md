## 目录结构

```
├── README.md               
├── build.sh                //部署脚本
├── environment.yaml        //环境变量
├── fekit.config            
├── fekit_modules
└── src                     //源码
    ├── scripts             //脚本
    │   ├── filters         //过滤器
    │   ├── layout          //页面结构
    │   ├── pages           //业务代码
    │   ├── ui              //ui组件
    │   ├── util            //工具代码
    │   └── vendor          //第三方（建议通过bower获取）
    └── styles              //样式
        ├── components      //组件样式
        ├── layout          //框架样式
        ├── pages           //业务样式
        └── vendor          //第三方（建议通过bower获取）
```

部分文件夹及文件的作用

### README

README的作用就是告诉我们这个项目是什么，可以做什么以及怎么用，一个avalon项目的README应该至少包含如下内容：

+ 目录结构说明

+ 项目用途及简单介绍

+ 部署说明

+ 相关接口的描述文档

+ 测试环境及访问地址

+ 脚本的功能及使用方式（如果项目内有脚本，需要说明脚本的功能及使用方式）

### environment.yaml

environment.yaml用来做不同环境的区分hook，可以用来区分本地（Local），开发环境（DEV），测试及生产环境（PRD）

### fekit_modules

用来放置fekit的modules

### src

用来放置项目的源码，一般分为scripts及styles两个文件架，Qunar有专门的图片服务器，一般项目中的图片不单独设置图片文件夹，而是直接请求图片服务器。