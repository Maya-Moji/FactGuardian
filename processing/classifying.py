import pandas as pd
import string
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from spacy.lang.en import English
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.base import TransformerMixin
from sklearn.linear_model import LogisticRegression
from sklearn import metrics
from sklearn.pipeline import Pipeline


class CleanPost(TransformerMixin):
    def fit(self, X, y=None, **fit_params):
        return self

    def transform(self, X, **transform_params):
        return [self.clean(tweet) for tweet in X]

    def get_params(self, deep=True):
        return {}

    def clean(self, tweet):
        return tweet.strip().lower()


class ClassifyPost:
    def __init__(self):
        self.df = self.load_dataframe()
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(self.df['tweet'], self.df['class'], test_size=0.2, random_state=42)

        self.nlp = spacy.load('en_core_web_sm')
        self.stop_words = STOP_WORDS
        self.punctuation = string.punctuation
        self.parser = English()

        self.bow_vector = CountVectorizer(tokenizer=self.tokenizer, ngram_range=(1, 1))
        self.tfidf_vector = TfidfVectorizer(tokenizer=self.tokenizer)

        self.pipe = self.create_pipeline()

    def load_dataframe(self):
        myDataFrame = pd.read_csv('../training/labeled_data_updated.csv') # 0:Hate Speech - 1:Offensive Language - 2-Neither
        myDataFrame = myDataFrame.drop(myDataFrame.columns[[0, 1, 2, 3, 4]], axis=1)  # drop columns 0 to 4

        # clean tweets
        myDataFrame['tweet'] = myDataFrame['tweet'].replace(to_replace=r'https://.*', value='', regex=True)  # https://
        myDataFrame['tweet'] = myDataFrame['tweet'].replace(to_replace=r'http://.*', value='', regex=True)  # http://
        myDataFrame['tweet'] = myDataFrame['tweet'].replace(to_replace=r'&.*;', value='', regex=True)  # emojis
        myDataFrame['tweet'] = myDataFrame['tweet'].apply(lambda tweet: " ".join(filter(lambda x: x[0] != '@', tweet.split())))  # @
        myDataFrame['tweet'] = myDataFrame['tweet'].apply(lambda tweet: " ".join(filter(lambda x: x[0] != '#', tweet.split())))  # #
        myDataFrame['tweet'] = myDataFrame['tweet'].replace(to_replace=r'\brt|RT\b', value='', regex=True)  # RT

        return myDataFrame

    def tokenizer(self, tweet):
        tokens = self.nlp(tweet)

        # Reduce to base if it's not a pronoun, otherwise use lowercase form
        processed_tokens = [word.lemma_ if word.lemma_ != "-PRON-" else word.lower_ for word in tokens]

        # Remove stop words and punctuations
        processed_tokens = [word for word in processed_tokens if word not in self.stop_words and word not in self.punctuation]

        return processed_tokens

    def create_pipeline(self):
        lr_classifier = LogisticRegression(max_iter=5000)
        return Pipeline([('cleaner', CleanPost()),
                         ('vectorizer', self.bow_vector),
                         ('classifier', lr_classifier)])

    def fit_model(self):
        self.pipe = self.create_pipeline()
        self.pipe.fit(self.X_train, self.y_train)

    def predict_label(self):
        predictions = self.pipe.predict(self.X_test)
        print("Logistic Regression Accuracy:", metrics.accuracy_score(self.y_test, predictions))

    def label_new(self, new_tweet):
        prediction = self.pipe.predict([new_tweet])

        print('Tweet Content: \"{}\"\n\t Classification: {}'.format(new_tweet, prediction))

        return prediction


if __name__ == '__main__':
    tweet_classifier = ClassifyPost()
    tweet_classifier.fit_model()
    tweet_classifier.predict_label()
