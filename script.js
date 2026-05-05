document.addEventListener('DOMContentLoaded', function () {
    const navbarLinks = document.querySelectorAll('.navbar-links a');
    
    navbarLinks.forEach(link => {
        link.addEventListener('click', function () {
            navbarLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
});