const resultElement = document.getElementById("result");
      const statusText = document.getElementById("status-text");
      const wordCountElement = document.getElementById("word-count");
      const langSelect = document.getElementById("lang-select");
      const langLabel = document.getElementById("active-lang-label");
      let recognition;
      let selectedLang = localStorage.getItem('selectedLang') || 'en-US';
      langSelect.value = selectedLang;
      updateLangLabel();

      const recordBtn = document.querySelector('.record-btn');

      function changeLanguage() {
        selectedLang = langSelect.value;
        localStorage.setItem('selectedLang', selectedLang);
        updateLangLabel();
        if (recognition) {
          recognition.lang = selectedLang;
        }
      }

      function updateLangLabel() {
        const selectedOptionText = langSelect.options[langSelect.selectedIndex].text;
        langLabel.textContent = `Current Language: ${selectedOptionText}`;
      }

      function startConverting() {
        if ('webkitSpeechRecognition' in window) {
          recognition = new webkitSpeechRecognition();
          setupRecognition(recognition);
          recognition.lang = selectedLang;
          recognition.start();

          statusText.textContent = "Listening...";
          statusText.classList.add("listening");
          recordBtn.classList.add('active');
        } else {
          alert("Speech recognition not supported in this browser.");
        }
      }

      function setupRecognition(recognition) {
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function (event) {
          const { finalTranscript, interTranscript } = processResult(event.results);
          const combinedText = finalTranscript + interTranscript;
          resultElement.innerHTML = combinedText;
          updateCounts(combinedText);
        };
      }

      function processResult(results) {
        let finalTranscript = '';
        let interTranscript = '';
        for (let i = 0; i < results.length; i++) {
          let transcript = results[i][0].transcript;
          transcript.replace("\n", "<br>");

          if (results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interTranscript += transcript;
          }
        }
        return { finalTranscript, interTranscript };
      }

      function stopConverting() {
        if (recognition) {
          recognition.stop();
          statusText.textContent = "Recording stopped.";
          statusText.classList.remove("listening");
        }
      }

      function updateCounts(text) {
        const words = text.trim().split(/\s+/).filter(Boolean);
        const characters = text.replace(/\s+/g, '').length;
        const readingTime = Math.ceil(words.length / 200);

        wordCountElement.textContent = `Word Count: ${words.length}`;
        document.getElementById("char-count").textContent = `Character Count: ${characters}`;
        document.getElementById("read-time").textContent = `Estimated Reading Time: ${readingTime} min`;
      }

      function copyText() {
        const text = resultElement.innerText;
        navigator.clipboard.writeText(text).then(() => {
          alert("Text copied to clipboard!");
        }).catch(err => {
          alert("Failed to copy: " + err);
        });
      }

      function downloadText() {
        const text = resultElement.innerText;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "transcript.txt";
        link.click();

        URL.revokeObjectURL(url);
      }

      function clearTranscript() {
        resultElement.innerHTML = '';
        wordCountElement.textContent = 'Word Count: 0';
        document.getElementById("char-count").textContent = 'Character Count: 0';
        document.getElementById("read-time").textContent = 'Estimated Reading Time: 0 min';
        statusText.textContent = 'Transcript cleared. Click the mic to start speaking.';
        statusText.classList.remove("listening");
      }