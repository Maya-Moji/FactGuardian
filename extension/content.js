(function () {
  var badWords = ['vulgar', 'profanity', 'stupid', 'fuck', 'fucker', 'fucking', 'fucked', 'cock', 'pussy', 'faggot', 'cocklicker', 'cocksucker', 'bitch', 'shit', 'dick', 'whore', 'hoe'];
  var profanityArray = ['profanity', 'fuck', 'fucker', 'fucking', 'fucked', 'pussy', 'cocklicker', 'cocksucker', 'whore'];
  var vulgarArray = ['vulgar', 'stupid', 'faggot', 'bitch', 'shit', 'dick', 'cock', 'hoe'];
  var processedTweets = [];
  var flaggedTweets = [];
  var responseProfanity1 = "Profanity can erode trust in online communities, breeding resentment and divisiveness. To gain a deeper insight into its destructive potential, read this thought-provoking article: ";
  var responseProfanity2 = 'Profanity can offend, disrupt communication, and harm relationships. Using respectful language promotes understanding, maintains professionalism, and fosters a positive atmosphere. Take a look at this article: ';
  var responseProfanity3 = 'In online communities, profanity can create a toxic atmosphere, fuel conflicts, and hinder productive discussions. To dive deeper into this topic, take a look at this article: '
  var responseVulgar1 = "Vulgar words, often dismissed as harmless, can inflict deep emotional wounds on others. To foster a more positive environment, delve into this comprehensive article: ";
  var responseVulgar2 = "Vulgar language in online communities can disrupt conversations, alienate users, and diminish the overall quality of interactions. To gain a deeper insight into its destructive potential, read this thought-provoking article: "
  var responseVulgar3 = "Vulgar language and bullying in online spaces can harm individuals, erode community trust, and create a hostile environment. Read more about this here: "
  var vulgarList = [responseVulgar1, responseVulgar2, responseVulgar3];
  var profanityList = [responseProfanity1, responseProfanity2, responseProfanity3];
  var generatedResponse = "";
  var flagType = 'None';
  var flagTypeArray = [];
  var isProcessing = false;
  var currentTweetContent = '';
  var tweetNumberMap = {};

  //event listener for iframe
  window.addEventListener('load', function load(event) {
    var iframe = document.createElement('iframe');
    // some settings, to be updated for dynamic height
    iframe.id = "iframe";
    iframe.name = "iframe";
    iframe.style.width = "330px";
    iframe.style.background = "#eee";
    iframe.style.height = "230px";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = "1000000000000000";
    iframe.frameBorder = "none";
    // end of settings
    iframe.src =
      chrome.runtime.getURL("iframe.html");
    document.body.appendChild(iframe);
  });

  // Listen to messages from background to toggle iframe
  chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.action == "must_toggle_iframe") {
      toggle_iframe();
    }
  });

  //for toggle iframe
  function toggle_iframe() {
    var iframe = document.getElementById("iframe");
    if (iframe.style.width == "0px") {
      iframe.style.width = "330px";
    } else {
      iframe.style.width = "0px";
    }
  }

  // Listen for messages from popup.js to get tweet content
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getTweetContent") {
      // Get the tweet content
      var isFlagged = true;
      var tweetContent = flaggedTweets[0];

      if (flaggedTweets.length === 0) {
        isFlagged = false;
        tweetContent = 'content looks good';
        //document.write(isFlagged);
      }
      //var tweetContent = flaggedTweets[0];
      // Send the tweet content back to popup.js
      sendResponse({ tweet: tweetContent, flag: isFlagged });
    }
  });

  // Listen for messages from popup.js to get "response"
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getResponse") {
      flagType = flagTypeArray[0];
      //rule-based
      if (flagType === 'RuleBasedVulgar') {
        var regenerateCount = Math.floor(Math.random() * 4)
        generatedResponse = vulgarList[regenerateCount];
      } else if (flagType === 'RuleBasedProfanity') {
        var regenerateCount = Math.floor(Math.random() * 4)
        generatedResponse = profanityList[regenerateCount];
      } else if (flagType === 'MLBased') {
        //ML-based
        var tweetContent = flaggedTweets[0];
        // Get the generated response
        generatedResponse = "loading reply....";
        generatedResponse = tweetContent;
      } else {
        generatedResponse = "This tweet has not been flagged.";
      }
      regenerateCount++;
      sendResponse({ myResponse: generatedResponse, myFlagType: flagType });
    }
  });

  //flag tweets and replace their content
  function replaceTweets() {
    var newProcessedTweets = [];
    var tweetContent = document.querySelectorAll("div[lang]");
    const elements = document.querySelectorAll('a[href^="/"][href*="/status/"]');

    const tweetNumbersSet = new Set();

    // getting and matching number for tweet
    const tweetNumbers = [].slice.call(elements).map(element => {
      const href = element.getAttribute('href');
      const match = href.match(/\/status\/(\d+)/);
      if (match && match[1]) {
        const tweetNumber = match[1];
        if (!tweetNumbersSet.has(tweetNumber)) {
          tweetNumbersSet.add(tweetNumber);
          return tweetNumber;
        }
      }
      return null;
    }).filter(Boolean); // This filters out the null values


    // if (tweetContent.length !== tweetNumbers.length) {
    //   console.log("Mismatch between tweet content and elements.");
    //   return;
    // }
    // Hate speech (code 0 - ML-based) -> replace with redacted
    // Profanity (code 1 - Rule-based) -> replace offensive word with asterisk

    [].slice.call(tweetContent).forEach(function (el, index) {

      var tweet = el.textContent === undefined ? el.innerText : el.textContent;
      const tweetId = tweetNumbers[index];
      if (tweetId) {
        //tweetNumbersSet[tweetId] = tweet; // Map tweet text to the tweet ID //tweetMap
        tweetNumberMap[tweetId] = tweet;
      }
      const http = new XMLHttpRequest();
      const url = 'http://localhost:5000/classify-content';

      http.open('POST', url);
      http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      http.responseType = 'json';

      var tweet = (el.textContent === undefined) ? el.innerText : el.textContent;
      newProcessedTweets.push(tweet);

      if (!processedTweets.includes(tweet)) {
        http.send(JSON.stringify({
          "tweet": tweet
        }));
      }

      http.onload = function () {
        var jsonResponse = http.response;
        console.log(jsonResponse);

        if (jsonResponse != null && jsonResponse["classification"] == 0) { //machine-learning based detection
          // setting global variable
          currentTweetContent = el.innerHTML.textContent;
          // wrapping the original content in a span with red font
          var redMessage = '<span style="color: red;">' + el.innerHTML + '</span>';
          var newContent = el.innerHTML.replace(/.*/s, redMessage);

          if (newContent != el.innerHTML) {
            el.innerHTML = newContent; //replaces page content with newContent
          }

          flaggedTweets.push(tweet);
          flagTypeArray.push("MLBased");
        } else { // if not flagged by ML
          tokens = tweet.split(" ")
          console.log(" === ");
          console.log(tokens);
          chrome.runtime.sendMessage({
            type: 'content_script_message',
            classification: jsonResponse['classification'],
            tweet: jsonResponse['tweet'],
            id_str: tweetId // Get the tweet number

          });
          for (var i = 0; i < tokens.length; i += 1) { //rule-based detection
            if (badWords.includes(tokens[i].toLowerCase().replace(/[^\w]/gi, ''))) { // Remove punctuation and double quotes, and convert to lowercase, then check against the list of words
              console.log(" --- ");
              console.log(tokens[i]);
              console.log(" --- ");
              // setting global variable
              currentTweetContent = el.innerHTML;
              // Highlight the processed word
              var highlightedWord = '<span style="background-color: yellow;">' + tokens[i] + '</span>';
              var newContent = el.innerHTML.replace(tokens[i].toLowerCase().replace(/[^\w]/gi, ''), highlightedWord);

              if (newContent != el.innerHTML) {
                el.innerHTML = newContent; //replaces page content with newContent
              }
              flaggedTweets.push(tweet);
              // what category of rule-based
              if (profanityArray.includes(tokens[i].toLowerCase().replace(/[^\w]/gi, ''))) { //profanity
                flagTypeArray.push("RuleBasedProfanity");
              } else if (vulgarArray.includes(tokens[i].toLowerCase().replace(/[^\w]/gi, ''))) { //vulgar
                flagTypeArray.push("RuleBasedVulgar");
              }

            }
          }
        }


      };
    });

    //setting array of processed tweets
    processedTweets = newProcessedTweets;
    chrome.runtime.sendMessage({ action: "sendTweetNumberMap", tweetNumberMap: tweetNumberMap });


  }

  // Replace words after every 3000 ms
  function mainFunc() {
    // If it determines hate speech of offensive language (0/1)

    replaceTweets();
    //refresh iframe
    //window.setInterval(reloadIFrame, 3000);
    //window.setInterval(iframeLoaded, 3000);
    window.setTimeout(mainFunc, 3000);
  }

  mainFunc();
})();


