//Scroll Console Monitor to bottom
const scrollToBottom = (id, loading) => {
  if (loading) return;
  var container = document.getElementById(id);
  container.scrollTop = container.scrollHeight;
}

module.exports = {
  scrollToBottom
}