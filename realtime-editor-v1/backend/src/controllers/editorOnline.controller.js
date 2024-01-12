
var that = module.exports = {
    editorOnline: async(req, res, next) => {
        res.write(`<h1> Socket IO Start on Port: ${process.env.PORT} <h1>`);
        res.end();
    }
}