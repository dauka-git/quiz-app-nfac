# quiz-app

#Project Description
Данный проект является фуллстак приложением позволяющим пользователям создавать, делиться и учавствовать в квизах с возможностью соревноваться по набранным очкам. Проект изначально должен был иметь как и single-player так и multiplayer режимы. Так же имеется полная аутентификация, создание квизов с помощью Gemini API с различными типами вопросов. 

Цель проекта: создание увлекательной платформы для обучания с фокусом на дальнейшее масштабирование.

  Installation and Setup Instructions

Follow these steps to set up and run the project locally:

Prerequisites





Node.js (v18.x or higher)



npm (v9.x or higher)



MongoDB (local instance or MongoDB Atlas)



Vercel CLI (for deployment)

Installation





Clone the Repository:

git clone <your-repo-url>
cd nfac_project



Install Dependencies:





For the root project:

npm install



For the frontend:

cd frontend
npm install



For the backend:

cd ../backend
npm install



Set Up Environment Variables:





Create a .env file in the backend/ directory with the following:

MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
GEMINI_API_KEY=<your-gemini-api-key>
FRONTEND_URL=http://localhost:5174
PORT=5000



Run MongoDB:





Ensure MongoDB is running locally (mongod) or use a MongoDB Atlas connection string.

Running the Application





Start the Backend:

cd backend
npm start





The backend will run on http://localhost:5000.



Start the Frontend:

cd ../frontend
npm run dev





The frontend will run on http://localhost:5174.



Access the Application:





Open http://localhost:5174 in your browser to use the app.

Deployment

To deploy the application on Vercel:





Install Vercel CLI:

npm install -g vercel



Log in to Vercel:

vercel login



Deploy the project:

cd ..
vercel deploy --prod



Set environment variables in the Vercel dashboard (under Settings > Environment Variables):





MONGODB_URI



JWT_SECRET



GEMINI_API_KEY



FRONTEND_URL (e.g., https://your-app.vercel.app)


#Проектирование

Основные фичи: аутентификация юзеров, разработка квизов, публичный поиск квизов (в доработке), multiplayer (в разработке)

Использовалась монолитная архитектура с раздельными директориями frontend и server. RESTful API для обработки данных квизов и юзеров, с планами использования WebSocket для одновремнных сессии.

Development:





Frontend: Built with React, TypeScript, and Vite for a fast development experience. Material-UI (MUI) was used for consistent UI components.



Backend: Built with Node.js, Express, and MongoDB (via Mongoose) for handling API requests and data storage.



Implemented user authentication with JWT for secure access.



Added multiplayer support using Socket.IO for real-time communication (though this faced limitations on Vercel).



Testing and Deployment:





Tested locally using manual testing (e.g., creating quizzes, logging in).


#Методология:
Typescript: для более строгой типизации, уменьшая мисматчи
Монолит: можно легче организовать зависимости у фронта и бэка.
Real-time feature (попытка): интегрировали Socket.IO для рил тайм обновлений.
Known Issues and Bugs





Multiplayer Limitation: The Socket.IO integration for multiplayer quizzes doesn’t work on Vercel due to WebSocket limitations in serverless functions. Users can’t currently join real-time quizzes.



404 Errors on Vercel: Early deployments failed due to incorrect API routing (/api/public-quizzes returning 404), later fixed by adjusting vercel.json and ensuring relative paths.



TypeScript Build Errors: Initial builds failed due to unused imports and type mismatches (e.g., ListItem button prop in MUI). These were resolved by removing unused imports and adjusting component props.

Why This Tech Stack?

The tech stack was chosen for the following reasons:





Frontend: React + TypeScript + Vite:





React: Industry-standard for building interactive UIs, with a large ecosystem and community support.



TypeScript: Ensures type safety, reducing bugs in a project with complex data (e.g., quiz structures).



Vite: Provides a fast development server and build process compared to Create React App, improving developer experience.



Backend: Node.js + Express + MongoDB:





Node.js/Express: Lightweight and widely used for RESTful APIs, with a simple setup for handling quiz data.



MongoDB: Flexible schema design suits the unstructured nature of quiz data (e.g., varying question types).



Material-UI (MUI): Offers pre-built, accessible components, speeding up UI development for a polished look.



Vercel for Deployment: Simplifies deployment with automatic scaling and domain management, ideal for a quick MVP launch despite WebSocket limitations.



Socket.IO: Chosen for real-time multiplayer features, though its limitations on Vercel highlight a need for alternative hosting in the future.

This stack balances development speed, scalability, and maintainability while leveraging modern tools for a robust application.
