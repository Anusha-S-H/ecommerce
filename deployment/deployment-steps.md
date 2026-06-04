# AWS EC2 Deployment Steps

## 1. Launch EC2 Instance

- Ubuntu 24.04
- t3.micro

## 2. Configure Security Groups

Open:

```text
22   SSH
80   HTTP
5000 Backend API
```

## 3. Connect to EC2

```bash
ssh -i key.pem ubuntu@<public-ip>
```

## 4. Clone Repository

```bash
git clone https://github.com/Anusha-S-H/ecommerce.git
```

## 5. Backend Setup

```bash
cd be
npm install
```

Create:

```text
.env
```

Start backend:

```bash
node server.js
```

## 6. Database Setup

Install MySQL:

```bash
sudo apt install mysql-server
```

Import database:

```bash
mysql ecommerce < ecommerce.sql
```

## 7. Frontend Build

```bash
cd fe
npm install
npm run build
```

## 8. Install Nginx

```bash
sudo apt install nginx
```

Copy build files:

```bash
sudo cp -r dist/* /var/www/html/
```

## 9. Configure Reverse Proxy

```nginx
location /api/ {
    proxy_pass http://localhost:5000;
}
```

## 10. Configure PM2

```bash
npm install -g pm2
pm2 start server.js
```

## 11. Associate Elastic IP

Attach Elastic IP to EC2 instance.

Application becomes publicly accessible.