# Baby Shower Invitation Website 🍼💕

A beautiful, elegant baby shower invitation website for Tarang & Vidhi's celebration, featuring RSVP functionality and an admin dashboard.

## Event Details 🎉

- **Parents:** Tarang & Vidhi
- **Hosted by:** Malani Family
- **Date:** June 28, 2026
- **Time:** 9:30 AM
- **Theme:** Royal but Cute
- **Culture:** Gujarati / Indian Celebration

## Features ✨

### Main Invitation Page
- **Elegant Hero Section** with animated countdown timer
- **Event Details** with venue information and map link
- **Family Section** introducing the hosts
- **Photo Gallery** with lightbox functionality
- **RSVP Form** with validation and local storage
- **Background Music Toggle** for ambient atmosphere
- **Responsive Design** optimized for all devices
- **Smooth Animations** and micro-interactions

### Admin Dashboard
- **Real-time Statistics** showing RSVP counts and guest numbers
- **Guest List Table** with sortable columns
- **Advanced Filtering** by search, guest count, and family side
- **CSV Export** functionality for data management
- **Family Side Breakdown** statistics
- **Mobile-Friendly** responsive design

## Technology Stack 🛠️

- **HTML5** - Semantic markup and structure
- **CSS3** - Custom styling with Indian/Gujarati luxury theme
- **Vanilla JavaScript** - No frameworks, pure JS functionality
- **Font Awesome** - Beautiful icons
- **Google Fonts** - Playfair Display & Poppins typography

## Project Structure 📁

```
baby-shower-site/
├── index.html                 # Main invitation page
├── dashboard/
│   └── index.html            # Admin dashboard
├── assets/
│   ├── css/
│   │   └── styles.css        # All styles for both pages
│   ├── js/
│   │   ├── app.js           # Main invitation functionality
│   │   └── dashboard.js     # Dashboard functionality
│   ├── data/
│   │   └── guests.json      # Sample guest data
│   └── music/
│       └── background.mp3   # Background music (add your own)
└── README.md                # This file
```

## Getting Started 🚀

1. **Download or clone** the project files
2. **Open `index.html`** in your web browser to view the invitation
3. **Navigate to `/dashboard/`** to access the admin panel
4. **Add your own music** file to `assets/music/background.mp3` (optional)

### Quick Start
```bash
# If using a local server
python -m http.server 8000
# Then visit http://localhost:8000

# Or simply open index.html directly in your browser
```

## Customization Guide 🎨

### Changing Event Details
Edit `index.html` and update the following sections:

```html
<!-- Update event details -->
<div class="detail-content">
    <h4>When</h4>
    <p>Your Event Date</p>
</div>

<!-- Update countdown timer -->
<script>
    // Change this date in app.js
    const eventDate = new Date('Your Event Date and Time').getTime();
</script>
```

### Modifying Colors
Edit the CSS variables in `assets/css/styles.css`:

```css
:root {
    --primary-color: #d4a574;    /* Gold/bronze */
    --secondary-color: #8b5a3c;  /* Dark brown */
    --accent-color: #e8c4a0;     /* Light gold */
}
```

### Adding Your Own Music
1. Place your music file at `assets/music/background.mp3`
2. The music toggle will automatically work with your file
3. Ensure the file is in MP3 format for best compatibility

### Customizing Family Information
Update the family section in `index.html`:

```html
<div class="family-grid">
    <div class="family-member">
        <div class="family-avatar">
            <i class="fas fa-user"></i>
        </div>
        <h4>Your Names</h4>
        <p>Your Relationship</p>
    </div>
</div>
```

## RSVP System 📝

### How It Works
1. Guests fill out the RSVP form on the main page
2. Data is saved to browser's localStorage
3. Dashboard reads from localStorage and displays statistics
4. Data can be exported as CSV for external use

### Backend Integration (Future)
The code is structured to easily connect to a backend:

```javascript
// In app.js - Uncomment and modify
async function submitToBackend(guestData) {
    // Connect to Google Sheets API or your backend
    const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData)
    });
    return response.json();
}
```

### Google Sheets Integration
To connect with Google Sheets:
1. Set up Google Sheets API
2. Create a web app endpoint
3. Replace the placeholder functions in both JS files
4. Update the API endpoint URLs

## Dashboard Features 📊

### Statistics Overview
- Total RSVPs received
- Total guests attending
- Guest count breakdown (under/over 15)
- Family side distribution

### Guest Management
- **Search**: Find guests by name, phone, or email
- **Filters**: Filter by guest count or family side
- **Sorting**: Click column headers to sort
- **Export**: Download guest list as CSV

### Admin Access
The dashboard is designed for internal use. For production:
1. Add password protection
2. Implement user authentication
3. Set up proper backend integration

## Deployment 📦

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main` or `master`)
4. Site will be available at `https://username.github.io/repository-name`

### Netlify/Vercel
1. Connect your Git repository
2. Configure build settings (if needed)
3. Deploy automatically

### Other Static Hosting
Upload the entire folder to any static hosting service.

## Browser Support 🌐

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Mobile Responsiveness 📱

- Fully responsive design
- Touch-friendly interface
- Optimized for mobile viewing
- Works on all screen sizes

## Troubleshooting 🔧

### Common Issues

**Music not playing?**
- Browsers block autoplay. Users must click the music button first.
- Ensure the music file exists at the correct path.

**Dashboard not showing data?**
- Check browser console for errors
- Ensure localStorage has data or guests.json exists
- Try refreshing the dashboard

**CSV export not working?**
- Check browser popup blockers
- Ensure you have guest data in the table

**Images not loading?**
- Gallery uses placeholder images from Picsum
- Replace with your own images in the gallery section

## Contributing 🤝

Feel free to customize this template for your own events!

## License 📄

This project is open source and available under the MIT License.

## Support 💝

For questions or customization help:
- Check the code comments for guidance
- Review the customization section above
- Test all features after making changes

---

Made with love for celebrating special moments! 💕👶🏽
