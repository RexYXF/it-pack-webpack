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
  }
  getSource(path) {
    return fs.readFileSync(path, 'utf-8')
  }
  depAnalyse(modulePath) {
    let source = this.getSource(modulePath)
    //console.log(source)

    let ast = parser.parse(source)
    traverse(ast, {
      CallExpression(p) {
        if(p.node.callee.name === 'require'){
          //修改require
          p.node.callee.name = '__webpack_require__'
        }
        //修改路径
        let oldValue = p.node.arguments[0].value
        oldValue = './' + path.join('src', oldValue)
        //避免Windows出现反斜杠
        p.node.arguments[0].value = oldValue.replace(/\\+/g, '/')
      }
    })
    let sourceCode = generator(ast).code
    console.log(sourceCode)

  }
  start() {
    //开始打包了
    //依赖的分析
    //__dirname表示的是it-pack项目中Compiler.js所在目录,而非入口文件所在目录
    //如果需要获取执行it-pack指令的目录,需要使用process.cwd()
    this.depAnalyse(path.resolve(this.root,this.entry))
  }
}

module.exports = Compiler