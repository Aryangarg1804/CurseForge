# Deployment Guide - Real-Time Support Chat System

## Production Deployment Checklist

### Pre-Deployment

- [ ] Test all features in development
- [ ] Run tests: `npm test`
- [ ] Check for console errors and warnings
- [ ] Update environment variables for production
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Review security settings

## Backend Deployment

### Option 1: Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=production-secret
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Deploy to Railway

```bash
# Install Railway CLI
# Login to Railway
railway login

# Link project
railway link

# Set environment variables
railway variables add JWT_SECRET=production-secret
railway variables add FRONTEND_URL=https://your-frontend-domain.com

# Deploy
railway up
```

### Option 3: Deploy to DigitalOcean App Platform

1. Connect GitHub repository
2. Set environment variables
3. Connect MongoDB Atlas
4. Configure domain
5. Deploy

### Environment Variables for Production

```env
PORT=8080
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/courseforge?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-key-here
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## Frontend Deployment

### Option 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-domain.com/api
# VITE_SOCKET_URL=https://your-backend-domain.com
```

### Option 2: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: Deploy to GitHub Pages

```bash
# Add to vite.config.ts
export default {
  base: '/courseforge/',
  // ... other config
}

# Build
npm run build

# Push to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

### Environment Variables for Production

```
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

## Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to mongodb.com/cloud
   - Create free tier cluster
   - Choose your region

2. **Configure Network**
   - Add IP whitelist: `0.0.0.0/0` (or specific IPs)
   - Create database user
   - Get connection string

3. **Create Collections**
   - Database: `courseforge`
   - Collections: `users`, `courses`, `chats`, `messages`

4. **Add Indexes** (Optional but recommended)
   ```javascript
   // chats collection
   db.chats.createIndex({ userId: 1, createdAt: -1 })
   db.chats.createIndex({ supportAgent: 1, status: 1 })
   db.chats.createIndex({ lastMessageTime: -1 })

   // messages collection
   db.messages.createIndex({ chatId: 1, createdAt: -1 })
   db.messages.createIndex({ senderId: 1, createdAt: -1 })
   db.messages.createIndex({ chatId: 1, seen: 1 })
   ```

## CORS Configuration

Update CORS in `server.js` for production:

```javascript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "https://your-frontend-domain.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/key.key;

    location / {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Performance Optimization

### Backend
```javascript
// Enable compression
import compression from 'compression';
app.use(compression());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Frontend
- Build with: `npm run build`
- Minimize bundle size
- Enable gzip compression
- Use CDN for static assets

## Monitoring & Logging

### Backend Logs
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "courseforge"
pm2 logs courseforge

# Using Winston
npm install winston
```

### Error Tracking
- Set up Sentry: https://sentry.io
- Or use DataDog, New Relic, etc.

### Database Monitoring
- MongoDB Atlas provides built-in monitoring
- Set up alerts for connection issues
- Monitor query performance

## Backup Strategy

### MongoDB Backup
```bash
# Backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/courseforge"

# Restore
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/courseforge" dump/
```

### Automated Backups
- Enable MongoDB Atlas automated backups
- Set backup frequency: Daily
- Retention period: 35 days

## SSL Certificate Renewal

### Auto-Renewal with Let's Encrypt

```bash
# Renew manually
sudo certbot renew

# Auto-renew (runs automatically with certbot timer)
```

## Load Balancing (Optional)

For high traffic:

```javascript
// Use sticky sessions for Socket.IO
const io = new SocketIOServer(httpServer, {
  transports: ['websocket', 'polling'],
  // For load balancing
  adapter: require('socket.io-redis')({
    host: 'localhost',
    port: 6379
  })
});
```

## Post-Deployment

1. **Test all features**
   - User chat functionality
   - Admin dashboard
   - Real-time messaging
   - File uploads
   - Edge cases

2. **Monitor performance**
   - Check server CPU/memory
   - Monitor response times
   - Track error rates

3. **Security checks**
   - Test authentication
   - Verify HTTPS
   - Check CORS headers
   - Test rate limiting

4. **Set up alerts**
   - Server down alerts
   - High error rate alerts
   - Database connection alerts

## Troubleshooting Production Issues

### Socket.IO Not Connecting
- Check CORS origins
- Verify SSL certificates
- Check firewall rules
- Review error logs

### Database Connection Issues
- Verify MongoDB URI
- Check IP whitelist
- Test connection string
- Review connection pool settings

### High Latency
- Check server resources
- Optimize database queries
- Enable caching
- Use CDN for static files

### Memory Leaks
- Monitor Node.js memory
- Check for circular references
- Use profiling tools
- Implement proper cleanup

## Rollback Plan

1. Keep previous version deployed
2. Have backup of database
3. Keep recent backups of code
4. Document deployment steps
5. Have rollback script ready

## Scaling Strategy

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session storage
- Implement database replication

### Vertical Scaling
- Upgrade server resources
- Optimize code and queries
- Use caching layers
- Implement pagination

## Maintenance Window

For updates or maintenance:
```javascript
// Maintenance mode endpoint
app.get('/maintenance', (req, res) => {
  res.status(503).json({ message: 'Under maintenance' });
});
```

## Contact & Support

For deployment issues, contact DevOps team or infrastructure support.
