const { nativeTheme } = require('electron');

// Sistem teması değiştiğinde olay dinleyicisi ekle
nativeTheme.on('updated', () => {
// Sistem temasına göre arka plan rengini ve yazı rengini ayarla
document.body.style.backgroundColor = nativeTheme.shouldUseDarkColors ? '#333' : '#fff';
document.body.style.color = nativeTheme.shouldUseDarkColors ? '#fff' : '#333';

});

// Sayfa yüklendiğinde başlangıç temasını uygula
document.addEventListener('DOMContentLoaded', () => {
document.body.style.backgroundColor = nativeTheme.shouldUseDarkColors ? '#333' : '#fff';
document.body.style.color = nativeTheme.shouldUseDarkColors ? '#fff' : '#333';
});