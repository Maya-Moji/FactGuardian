var badTweet;
var myURL1 = "https://www.sciencedirect.com/science/article/pii/S002438412200170X";
var myURL2 = "https://journals.sagepub.com/doi/full/10.1177/0261927X18758143";
var myURL3 = "https://www.sciencedirect.com/science/article/pii/S0267364923000948"
var myURL = "";
var regenerateCount = 0;
var tweetNumberMap = {};
var tweetContent='';
var id='';
document.addEventListener("DOMContentLoaded", function () {
  //createHyperlink();
  //Hiding flag detection
  document.getElementById('flagDetection').style.visibility = 'hidden';
  document.getElementById('showMe').style.visibility = 'hidden';
  //Hiding tweet content
  document.getElementById('amIVisible').style.visibility = 'hidden';
  document.getElementById('hiddenSection').style.visibility = 'hidden';
  const port = chrome.runtime.connect({ name: 'popup' });
  showMeDetectionMessage();
  // show tweet button ---> Showing tweet content when button is clicked
  document.getElementById('showMe').addEventListener('click', showMeClickHandler);
  // refresh button --->
  document.getElementById('refresh').addEventListener('click', showMeDetectionMessage);

  //hide buttons that don't show until user clicks "Yes"
  var postButton = document.getElementById("post");
  var reloadButton = document.getElementById("reload");
  var cancelButton = document.getElementById("cancel");
  postButton.style.display = "none";
  reloadButton.style.display = "none";
  cancelButton.style.display = "none";

  //creating event listener for buttons showing on page
  //starting with clicking yes leads to a different layout
  var yesButton = document.getElementById("yesToStart");
  var noButton = document.getElementById("noToStart");

  // yes button ---> call yesClickHandler function when yes button is clicked
  document.getElementById('yesToStart').addEventListener('click', yesClickHandler);


  //changes for post buttonf untionality
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'content_script_message' && request.classification === 1) {
      id_str = request.id_str;

    }
    if (request.action === "sendTweetNumberMap") {
      tweetNumberMap = request.tweetNumberMap;
      // Now you can use tweetNumberMap in your popup.js
      console.log(tweetNumberMap);
    }


  });
  // no button ---> hide flag messages if user selects no // todo : ideally to change this so UI displays the next instance of hate speech if any (in the flaggedTweets array in content.js)
  noButton.addEventListener("click", function () {
    document.getElementById('amIVisible').style.visibility = 'hidden';
    document.getElementById('hiddenSection').style.visibility = 'hidden';
    document.getElementById('flagDetection').style.visibility = 'hidden';
    document.getElementById('showMe').style.visibility = 'hidden';
    noButton.style.visibility = 'hidden';
    yesButton.style.visibility = 'hidden';
    //window.close();
  });

  // reload button ---> get a new response from content.js
  document.getElementById('reload').addEventListener('click', reloadClickHandler);

  // cancel button ---> go back to first page if user selects cancel
  cancelButton.addEventListener("click", function () {
    //hide second page buttons
    postButton.style.display = "none";
    reloadButton.style.display = "none";
    cancelButton.style.display = "none";
    //show first page buttons yes and no
    yesButton.style.display = "block";
    noButton.style.display = "block";
    document.querySelector(".middleText").innerHTML = "";
    document.getElementById('amIVisible').textContent = "";
    showMeDetectionMessage();
    document.getElementById("myURL").remove();
    //window.close();
  });




  postButton.addEventListener('click', () => {
    try {
      const generatedResponse = "test purpose";

      if (!id || !generatedResponse) {
        console.error('id_str or generatedResponse is not available.');
        return;
      }

      const tweetContent = encodeURIComponent(document.querySelector(".middleText").innerHTML + " " + myURL );
      const tweetIdToReplyTo = id;

      // Construct the Twitter web intent URL for replying
      const twitterURL = `https://twitter.com/intent/tweet?in_reply_to=${tweetIdToReplyTo}&text=${tweetContent}`;

      // Open the Twitter reply interface in a new tab
      window.open(twitterURL, '_blank');

    } catch (error) {
      console.error('Error opening Twitter intent:', error);
    }
  });
}); // end of DOMContentLoaded

// Function to get tweet number based on tweet content
function getTweetNumber(tweetContent) {
  for (const [tweetNumber, content] of Object.entries(tweetNumberMap)) {
      if (content === tweetContent) {
          return tweetNumber;
      }
  }
  // If the tweet content is not found in the map
  return null;
}
//Reloads a new response when "reload" button is clicked
function reloadClickHandler() {
  if (regenerateCount < 3) {
    yesClickHandler();
  } else {
    document.querySelector(".middleText").innerHTML = 'Too many reload request';
  }
  document.getElementById("myURL").remove();

}

//Shows tweet content when "show tweet" button is clicked
function showMeClickHandler() {
  // Send a message to the content.js to request the tweet content
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getTweetContent" }, function (response) {
      if (response && response.tweet) {
        // Set the tweet content in "amIVisible" and make the section visible
        document.getElementById('amIVisible').textContent = response.tweet;
        document.getElementById('amIVisible').style.visibility = 'visible';
        document.getElementById('hiddenSection').style.visibility = 'visible';
        tweetContent= response.tweet;
        id = getTweetNumber(tweetContent) ;


        //assign global variable to tweet to pass to chatGPT
      }
    });
  });
  //this.close(); // close the popup when the background finishes processing request
}

//Send message to content.js to generate response when "yes" button is clicked
function yesClickHandler() {
  // Send a message to the content.js to request the tweet content
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getResponse" }, function (response) {
      //hiding tweet content
      document.getElementById('amIVisible').style.visibility = 'hidden';
      document.getElementById('hiddenSection').style.visibility = 'hidden';
      document.getElementById('showMe').style.visibility = 'hidden';
      //showing new buttons
      document.getElementById("post").style.display = "block";
      document.getElementById("reload").style.display = "block";
      document.getElementById("cancel").style.display = "block";
      //hiding yes and no
      document.getElementById("yesToStart").style.display = "none";
      document.getElementById("noToStart").style.display = "none";
      if (response && response.myResponse) {
        // Set the response in UI
        if (response.myFlagType === 'RuleBasedVulgar') {
          document.querySelector(".middleText").innerHTML = response.myResponse;
          myURL = myURL1;
          createHyperlink();
        } else if (response.myFlagType === 'RuleBasedProfanity') {
          document.querySelector(".middleText").innerHTML = response.myResponse;
          myURL = myURL2;
          createHyperlink();
        } else if (response.myFlagType === 'MLBased') {
          document.querySelector(".middleText").innerHTML = response.myResponse;
          generateResponseFromChatGPT(response.myResponse);
          myURL = "";
          //Link appears to early. Need to find a way to remove line while API is running
          //                        myURL = myURL3;
          //                        createHyperlink();
        } else {
          document.querySelector(".middleText").innerHTML = "Something went wrong went fetching a response.";
        }
        regenerateCount++;
      }
    });
  });
}

//hyperlink
function createHyperlink() {
  var a = document.createElement('a');
  var linkText = document.createTextNode("link to article");
  a.appendChild(linkText);
  a.title = "link opens in new tab";
  a.href = myURL;
  a.target = "_blank";
  a.id = "myURL";
  document.querySelector(".text").appendChild(a);
}

//Shows flag detection message when tweets are flagged
function showMeDetectionMessage() {
  //document.getElementById('flagDetection').textContent = 'You are inside showMeDetectionMessage';
  // Send a message to the content.js to request the tweet content
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getTweetContent" }, function (response) {
      if (response && response.flag) {
        // Set the tweet content in "amIVisible" and make the section visible
        document.getElementById('flagDetection').textContent = 'Hate Speech or inappropriate language detected. Would you like to post a reply?';
        document.getElementById('flagDetection').style.visibility = 'visible';
        document.getElementById('showMe').style.visibility = 'visible';
        //show buttons
        document.getElementById('yesToStart').style.visibility = 'visible';
        document.getElementById('noToStart').style.visibility = 'visible';
        if (response && response.tweet) {
          document.getElementById('amIVisible').textContent = response.tweet; //TODO: refresh functionality to be enhanced
        }
      } else if (response && !response.flag) {
        document.getElementById('flagDetection').textContent = 'No instances of hate speech detected';
        document.getElementById('flagDetection').style.visibility = 'visible';
        //hide buttons
        document.getElementById('yesToStart').style.visibility = 'hidden';
        document.getElementById('noToStart').style.visibility = 'hidden';
      }
      //ensure count is back to 0 when user is at this step
      regenerateCount = 0;
    });
  });
}

// Generate Response From ChatGPT API
async function generateResponseFromChatGPT(badTweet) {
  //display while api is fetching
  document.getElementById('flagDetection').textContent = "loading reply....";
  //add tweet to message sent to chatGPT
  var chatMessage = "Can you explain why this sentence is offensive using only 30 tokens in a conversational tone: " + badTweet;

  try {
    // Define the API key
    const API_KEY = "**************"; //replace stars with your API key

    // Define the endpoint URL
    const endpointUrl = "https://api.openai.com/v1/chat/completions";

    // Define the headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    };

    // Define the prompt to send to the API
    const prompt = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: chatMessage }], // change prompt to messages array
      temperature: 0.5,
      //   max_tokens: 30, // Setting the number of tokens but it cuts off the response. it's best to define the number of tokens as part of the chatMessage.
    };

    // Send a POST request to the endpoint with the prompt and headers
    fetch(endpointUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(
        prompt),
    }).then((response) => response.json())
      .then((data) => {
        //display response on extension
        document.querySelector(".middleText").innerHTML = JSON.stringify(data.choices[0].message.content);       //+"To gain further incite on this topic, take a look at this article: ";
      })
  } catch (e) {
    console.error("Error while calling openai api", e);
  }
}






