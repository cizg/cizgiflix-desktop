const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded',()=>{
    ipcRenderer.invoke('getInjectScriptContent')
    .then((scriptContent) => {
        //console.log('Inject işlemi başarılı:', script);
        
        // script dosyamız script tagları içinde 
        const script = document.createElement('script');
        script.text = scriptContent;
        

        // burada özel elementlerin içine kendi scriptimizi injecte ediyoruz
        //let iframe1 = document.getElementById('#vjs-overlayclip-box');
        //let iframe2 = document.getElementById('#src-frame');
        //let iframeDocument1 = iframe1.contentWindow.document;
        //let iframeDocument2 = iframe2.contentWindow.document;

        // apend ediyoruz elementlere
        document.body.appendChild(script);
        //iframeDocument1.head.appendChild(scriptElement);
        //iframeDocument2.head.appendChild(scriptElement);

    })
    .catch((error) => {
      console.error('Inject işlemi başarısız:', error);
    });  
})