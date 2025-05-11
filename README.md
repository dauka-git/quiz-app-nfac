Quiz App NFAC — web-quiz app for nFactorial Incubator project.

You can create quizzes, participate and store them in your personal profile with  safe logging
and registration.

Essentials:

Node.js
npm 
Git (to copy).
Google API Key 

Steps:

Clone the repo:
git clone https://github.com/dauka-git/quiz-app-nfac.git
cd quiz-app-nfac


install frontend:
cd frontend
npm install


install backend:
cd ../server
npm install


keep your keys clean:

In server folder add your .env file.
Add your Google API Key :GOOGLE_API_KEY=your_key
PORT=5000




run all:

Backend:cd server
npm start

Он будет на http://localhost:5000.
Frontend:
cd frontend
npm start

will appear at http://localhost:3000.

Now go to the  http://localhost:3000 in your browser and enjoy!
Note: the deploy is planned


Planning: 
set basic design and created an easy logging with the storing in MongoDB
Created API, logic and interface.
TODO: deploy and add multiplayer mode.

Main Stack (classic MERN):
Frontend:  React, because of the easy opportunity to use components (MaterialUI). Used ESLint (eslint.config.js), for cleaner code.
Backend: Node.js with Express. contains API that stores and sends requests.
MongoDB: for safer data storing


Testing:
By hand: passed the quizzes, logged, checked on the phone.
Checked API by Postman


Approaches:

components UI: in React created components, such as QuestionCard, to resuse
Git: at first frontend was a submodule, but it was fixed.
MongoDB: to optimize data storage.


Authorization:
Selected: simple login using JWT.
why: fast and cheap.
alternatives: Google OAuth.


Testing:
Selected: manually.
why: fast, tried to find all bags.
alternatives: Jest, but requires time.


Why this stack?

React:
simple and reusable interfaces. Components, MaterialUI, easier styles configuration.


Node.js + Express:
JavaScript all for everything, for scalability considering switch to the GO.
Express in combination.


Google API:
to generate the quizzes according to the specific prompt.


ESLint:
Clean code. Set in eslint.config.js.


GitHub: dauka-git
Почта: marlambekovdaulet@gmail.com

