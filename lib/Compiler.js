const path = require('path')
const fs = require('fs')


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
    console.log(source)

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