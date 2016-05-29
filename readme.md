## 运行

### 首次运行

在文件中新建`config.json`，里面加上
```
{
  "salt": "盐"
}
```

然后执行
```
$ npm install
$ npm start
```

访问`localhost:3096`即可

### Windows下脚本

#### babel编译脚本

> 可能需要在管理员权限的PowerShell下执行`set-executionpolicy remotesigned`

**run.ps1**

```
babel -d dist/ src/
cp ./src/public ./dist -r -force
cp ./src/views ./dist -r -force
```

### *nix下脚本

> 首次建立记得执行`chmod +x`

#### 更新脚本

**update**

```
$ forever stop ./dist/bin/www
$ git pull
$ npm install
$ ./run
$ forever start ./dist/bin/www
```

#### babel编译脚本

**run**

```
forever stop dist/bin/www
babel -d dist/ src/
cp -rf ./src/public ./dist
cp -rf ./src/views ./dist
forever start dist/bin/www
```