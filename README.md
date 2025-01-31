# Online Collaboration Platform

This is a real-time online collaboration platform that allows users to join rooms, edit and execute code collaboratively, and communicate with each other.

## Features
- Real-time code editing with multiple users in a room
- Live language selection for coding
- Online code compilation and execution
- User activity indicators (e.g., typing status)
- Room-based user management

## Technologies Used
### Backend:
- **Node.js** with **Express.js**
- **Socket.io** for real-time communication
- **Axios** for HTTP requests

### Frontend:
- **React.js** for UI components
- **SCSS** for styling

## Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (Node Package Manager)

### Installation Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/online_collab.git
   cd online_collab
   ```
2. Install dependencies:
   ```sh
   npm run build
   ```
3. Start the backend server:
   ```sh
   npm run dev
   ```
4. Open the project in your browser at `http://localhost:3002`.

## Project Structure
```
online_collab/
│── backend/
│   ├── index.js       # Main server file
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js      # Main React component
│   │   ├── App.css     # Styling file
│── package.json       # Project dependencies
│── README.md          # Documentation
```

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/` | Serves frontend files |
| POST | `/compileCode` | Executes user-submitted code |

## Deployment
To deploy this project, use any cloud provider supporting Node.js apps, such as:
- [Render](https://render.com/)
- [Heroku](https://www.heroku.com/)
- [Vercel](https://vercel.com/) (for frontend)



