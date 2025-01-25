    
        async function save(data) {
            try {
      const response = await fetch('/data3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data }), // Specify 'save' action
      });
      if (response.ok) {
        const result = await response.json();
     
      }
       }catch{
     
      }
          }
  
          async function load() {
            try {
      const response = await fetch('/data3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load' }), // Specify 'load' action
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Loaded data:', result.data);
        return result.data; // Return loaded data
      } 
  
         }catch{
        
      }
          }
  
          async function sendRequest(r, t) {
    try {
      const response = await fetch('/AI-Assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ r }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      const responseElement = document.getElementById(`response${t}`);
      if (responseElement) {
       // responseElement.innerText = `AI: ${data1.response}`;
       data3[t] = `AI: for Q${t+1}  ${data.response}\n`;
        
      } else {
        data3[t] = `AI: for Q${t+1}\n`;
        console.error(`Response element not found for ID response${t}`);
      }
    } catch (error) {
      data3[t] = `AI: for Q${t+1}\n`;
      console.error('Error during fetch request:', error);
      const responseElement = document.getElementById(`response${t}`);
      if (responseElement) {
        responseElement.innerText = 'Error: Unable to get a response from the server.';
      }
    }
  }
          async function processImagesSequentially(data_Ai) {
             
              if (!window.questions) window.questions = [];
              //const data3 = [];
            
              const progress = document.getElementById(`progress`);
              const updateProgress = (message) => (progress.innerText = message);
  
              
              for (let i = 0; i < data_Ai.length; i++) {
                
                const { imgq, Q } = data_Ai[i];
               try { 
                if (imgq) {
                  
                    updateProgress(`Processing image ${i + 1} of ${data_Ai.length}...`);
          
                     const result = await Tesseract.recognize(imgq, 'eng', {
                      logger: (message) => {
                        if (message.status === 'recognizing text') {
                          updateProgress(
                       `Image ${i + 1}: ${message.status}: ${(message.progress * 100).toFixed(2)}%`
                         );
                      }
                      },
                    });
        
                   
                    const extractedText = result.data.text;
                    window.questions[i] = Q + '\n' + extractedText;
                     r =  window.questions[i];
                     await  sendRequest(r,i);
                    updateProgress(`Done with image ${i + 1}.`);
                  
                } else{
                  r=Q;
                  updateProgress(`Done with question ${i + 1}.`);
                  await sendRequest(r,i);
                     }
                 } catch (error) {
                    console.error(`Error processing image ${i + 1}:`, error);
                    updateProgress(`Error processing ${imgq ? 'image' : 'question'} ${i + 1}.`);
                  }
                 
              }
        
              // Final status
              progress.innerText = 'All images processed!';
              
              const { jsPDF } = window.jspdf;
               const pdf = new jsPDF();
  
               save(data3);
              
               data3.forEach((text, index) => {
    
                 pdf.setFontSize(14);
                 pdf.text(`Question ${index + 1}`, 10, 20); 
    
    
                 pdf.setFontSize(12);
                 const pageWidth = pdf.internal.pageSize.width - 20; 
                 const lines = pdf.splitTextToSize(text, pageWidth); 
                 let cursorY = 30;
  
                 lines.forEach((line) => {
                   if (cursorY > pdf.internal.pageSize.height - 20) {
                     pdf.addPage();
                     cursorY = 20; 
                   }
                   pdf.text(line, 10, cursorY);
                   cursorY += 10;
                 });
  
                 if (index < data3.length - 1) pdf.addPage(); 
                });
              pdf.save("examforyou.pdf");
             
  
              const data = await response.json();
  
              
            }
           
            function startTimer() {
            const timerElement = document.getElementById("timer");
  
      const interval = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
  
        // Update the timer display
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
        // Stop the timer when it reaches zero
        if (time <= 0) {
          clearInterval(interval);
         
          document.getElementById("AI-Assist").click(); // Automatically submit the form
        }
         
        time--;
      }, 1000);
    } 
   