const path = require('path')
const fs = require('fs')
//AST抽象语法树
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default

class Compiler {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    //获取执行it-pack指令的目录
    this.root = process.cwd()
    //初始化一个空对象,存放所有的模块
    this.modules = {}
  }
  getSource(path) {
    return fs.readFileSync(path, 'utf-8')
  }
  depAnalyse(modulePath) {
    //读取模块内容
    let source = this.getSource(modulePath)
    //console.log(source)

    //准备一个依赖数组,用于存储当前模块的所有依赖
    let dependencies = []

    let ast = parser.parse(source)
    traverse(ast, {
      CallExpression(p) {
        if (p.node.callee.name === 'require') {
          //修改require
          p.node.callee.name = '__webpack_require__'
          //修改路径
          let oldValue = p.node.arguments[0].value
          oldValue = './' + path.join('src', oldValue)
          //避免Windows出现反斜杠
          p.node.arguments[0].value = oldValue.replace(/\\+/g, '/')
          
          //每找到一个require调用,就将其中的路径修改完毕后加入到依赖数组中
          dependencies.push(p.node.arguments[0].value)
        }
      }
    })
    let sourceCode = generator(ast).code
    //console.log(sourceCode)

    //构建modules对象
    //{"./src/index.js":"xxxx","./src/news.js":"yyyy"}
    //path.relative剪裁(短,长)
    let modulePathRelative = './' + path.relative(this.root, modulePath)
    modulePathRelative = modulePathRelative.replace(/\\+/g,'/')
    this.modules[modulePathRelative] = sourceCode

    //console.log(dependencies)
    //递归加载所有依赖
    dependencies.forEach(dep =>this.depAnalyse(path.resolve(this.root, dep)))

  }
  start() {
    //开始打包了
    //依赖的分析
    //__dirname表示的是it-pack项目中Compiler.js所在目录,而非入口文件所在目录
    //如果需要获取执行it-pack指令的目录,需要使用process.cwd()
    this.depAnalyse(path.resolve(this.root, this.entry))
    console.log(this.modules)
  }
}

module.exports = Compiler