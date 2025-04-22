function formattedTime() {
    const now = new Date();
  
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
  
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }
  

module.exports = { formattedTime };