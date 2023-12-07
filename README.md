# Fact Guardian Chrome Extension for X

## Description
This is a Chrome extension that scans the content of your Twitter feed and detects instances of inappropriate language or hate speech through two layers of ML-based and rule-based classification. It then generates a friendly conversation-like response to the flagged comment and gives the user the option to reply to the flagged post with a couple of clicks. The user is able to regenerate the response if it is not satisfactory up to 3 times. The auto-generated response usually includes a link to an external reputable article for further information.


## Guide
1. Download the package.
2. Install the extension on your Chrome browser in developer mode. Load the content of the extension folder.
3. Replace the API key where noted in popup.js file with your API key obtained from Open AI.
4. Run the run_me_first.py file located in "processing" folder.
5. Browse to Twitter (X).
6. Click on Fact Guardian logo on your browser.
7. Click on the refresh button for the extension to scan your feed.
8. Click on "Show Me" button to see the content of the flagged tweet.
9. Click on "Yes" button to navigate to response generation.
10. Click on reload icon if you are not satisfied with the auto-generated response.
11. Click on "Post" button to post the auto-generated response as a reply to the flagged post.
12. Click on Fact Guardian logo again to close the extension.


## Demo
Check out the extension in action:\
https://github.com/Maya-Moji/FactGuardian/assets/106558260/4145e0f7-deda-4f72-b72d-2c023ff5f4bf


## Documentation
### Project Report
This is a comprehensive report on the project that outlines the below:\
[Final Project Report.pdf](https://github.com/Maya-Moji/FactGuardian/files/13604761/Final.Project.Report.pdf)
- Product Description
- Team and Client Description
- Requirements
- Design Evolution
- Technical Description
- Cycle of Operation
- UML, Project Plan Organization, and Project Tools
- Project Testing
- Modifications and Conclusion


### Static Website
A static website has been developed for future extension downloads. \
Here is the link to static website's code:\
https://github.com/Shaunessee-Green/Fact-Guardian-Webpage.git 


### Future Work
The following proposals outline potential areas of growth and development:
- **Expanding Platform Reach**: The Fact Guardian project, having proven its efficacy on Twitter (X), could explore extending its influence on other major social media platforms like Facebook, Instagram, and YouTube. This expansion would broaden its impact, creating a more comprehensive solution to combat hate speech across diverse online spaces. Similarly, the extension can be created for other web browsers such as Microsoft Edge, Firefox, etc. At later stages, the extension can be accompanied by a web application, desktop application, and mobile application to further expand its effectiveness.
- **Multilingual Capabilities**: To make the Fact Guardian extension more inclusive, the integration of multilingual support could be considered. Adapting the hate speech detection algorithms and response generation models to our French users would enhance its accessibility for a more localized user base.
- **User Feedback Integration**: Creating a feedback mechanism within the extension would empower users to actively contribute to its improvement. Allowing users to provide insights on the effectiveness of generated responses and report any inaccuracies could foster a collaborative environment for ongoing enhancements.
- **Continuous Machine Learning Refinement**: Machine Learning models are most effective when continuously updated. This ensures that the extension remains accurate and relevant in identifying emerging patterns and trends.
-	**Optimizing CSS Design**: As mentioned in Chapter 5 of the Project Report, a focus on optimizing the CSS design of the extension is recommended to ensure visual appeal. 
-	**User Education Initiatives**: Integrating educational resources within the extension UI could add value to the generated responses. This could include links to articles, guidelines, and community standards. The extension at its current development is utilizing gpt3.5 API which does not provide for external link generation. However, in future development, gpt4 API can be used to make link generation possible.
-	**Collaboration with Social Media Platforms**: Establishing collaborative partnerships with social media platforms could lead to a more integrated approach to combating hate speech. Leveraging platform-specific features and APIs would create a seamless user experience and enhance the extension's effectiveness as well as bypassing regulation limits set for bots.
-	**Moving to Azure Web Services**: Transitioning the Fact Guardian server to Azure Web Services presents an opportunity to capitalize on the platform's scalable infrastructure. By utilizing Azure's web hosting capabilities, the extension can efficiently handle increased user loads while benefiting from Azure's reliability and performance. A comprehensive step-by-step guide for migrating the Fact Guardian server to Azure Web Services has already been created. This documentation covers crucial aspects of the migration process, offering clear instructions on virtual machine setup, web integration, and security measures. Users can leverage this resource for a seamless and well-guided transition to Azure Web Services.
-	[FactBot - Set Up Flask Server.docx](https://github.com/Maya-Moji/FactGuardian/files/13606266/FactBot.-.Set.Up.Flask.Server.docx)




## References
Dataset used for training ML-base detection model (modified):
- https://github.com/t-davidson/hate-speech-and-offensive-language/tree/master/data

