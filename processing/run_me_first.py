from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from classifying import ClassifyPost


class TweetClassifierServer:
    def __init__(self):
        self.post_classifier = ClassifyPost()
        self.post_classifier.fit_model()


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

myServer = TweetClassifierServer()


@app.route('/classify-content', methods=['POST'])
@cross_origin()
def classify_tweet():
    currentFeed = request.get_json()
    tweet = None
    tweetClass = None

    if currentFeed:
        if 'tweet' in currentFeed:
            tweet = currentFeed['tweet']
            tweetClass = int(myServer.post_classifier.label_new(tweet)[0])

    response = {'tweet': tweet, 'classification': tweetClass}
    return jsonify(response)

if __name__ == '__main__':
    app.run()