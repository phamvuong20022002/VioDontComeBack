const {REACT_DATA} = require('./ReactData.js')
const JAVASCRIPT_DATA_INIT = {
    HTML:`<h1 class="welcome">Hello World</h1>`,
    CSS:`body{\n background: white; \n} \n.welcome{ color: red; text-align: center;}`,
    JAVASCRIPT:`let welcomeClass = document.getElementsByClassName('welcome')[0];\nif(welcomeClass){\n    welcomeClass.style.color = 'green';\n}`
}

const REACT_DATA_INIT = {
    HTML: REACT_DATA.HTML_VALUE,
    CSS: REACT_DATA.CSS_VALUE,
    JAVASCRIPT: REACT_DATA.JAVASCRIPT_VALUE,
}

const TABID_INIT = {
    HTML: '10',
    CSS: '20',
    JAVASCRIPT: '30'
}

const TYPE_INIT = {
    HTML: 'xml',
    CSS: 'css',
    JAVASCRIPT: 'javascript'
}
const TITLE_INIT = {
    HTML: 'index',
    CSS: 'styles',
    JAVASCRIPT: 'script'
};

module.exports = {
    JAVASCRIPT_DATA_INIT,
    TABID_INIT,
    TYPE_INIT,
    TITLE_INIT,
    REACT_DATA_INIT
}