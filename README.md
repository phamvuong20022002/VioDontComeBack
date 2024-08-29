
# 📝 Real-Time Collaborative Code Editor

Welcome to the **Real-Time Collaborative Code Editor**! This project allows multiple users to code together in real-time, with integrated ChatGPT support for coding assistance and seamless code storage functionalities.

## 🚀 Features

- **Real-Time Collaboration**: Multiple users can create and edit files simultaneously.
- **Integrated ChatGPT**: Get AI-powered code suggestions and assistance directly within the editor.
- **Code Storage**: Save your code securely and access it anytime.
- **User-Friendly Interface**: Built with React.js for a smooth and responsive user experience.

## 🛠️ Tech Stack

- **Frontend**: [React.js](https://reactjs.org/) ⚛️
- **Backend**: [Node.js](https://nodejs.org/) 🌐
- **Real-Time Communication**: WebSockets (for collaborative features) 💬

## 🖥️ Local Development

To run the project locally, follow these steps:

### Prerequisites

- Node.js installed
- npm or yarn installed

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/phamvuong20022002/VioDontComeBack.git
   cd realtime-editor-v1
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**

   ```bash
   npm start
   # or
   yarn start
   ```

   The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## ☁️ Deployment on AWS

To deploy this project on AWS, follow these steps:

### 1. AWS Setup

- **AWS Account**: Ensure you have an AWS account.
- **EC2 Instance**: Launch an EC2 instance with a Linux distribution (e.g., Ubuntu).
- **Security Group**: Configure security groups to allow HTTP (port 80) and SSH (port 22) access.

### 2. Server Setup

1. **SSH into your EC2 instance:**

   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

2. **Install Node.js and Git:**

   ```bash
   sudo apt update
   sudo apt install nodejs npm git -y
   ```

3. **Clone the repository on your server:**

   ```bash
   git clone https://github.com/phamvuong20022002/realtime-editor-v1.git
   cd realtime-editor-v1
   ```

4. **Install dependencies and build the project:**

   ```bash
   npm install
   npm run build
   ```

5. **Start the application:**

   ```bash
   npm start
   ```

   Optionally, you can use a process manager like [PM2](https://pm2.keymetrics.io/) to keep the application running:

   ```bash
   npm install -g pm2
   pm2 start npm --name "realtime-editor-v1" -- start
   ```

### 3. Access Your Application

- Visit your EC2 public IP address to access the application. For example: `https://code2d.io.vn`

## 📚 Documentation

For detailed documentation, visit the [Wiki](https://github.com/phamvuong20022002/VioDontComeBack/tree/main/realtime-editor-v1/README.md).

## 👥 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgements

- **React.js**: For the robust frontend framework.
- **Node.js**: For powering the backend.
- **ChatGPT**: For enhancing the coding experience.

---

Feel free to reach out if you have any questions or suggestions! 😊
