
// Called on category page to load projects for that category
function loadCategory(categorySlug) {
    // Fetch the projects data (from data/projects.json) and find the category with the matching slug
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(data => {
            const category = data.categories.find(c => c.slug === categorySlug);
            const container = document.getElementById('projects');

            //for every project in the category, create a card element and append it to the container
            category.projects.forEach(project => {
                fetch('/' + project.path + 'data.json')
                  .then(res => res.json()) // make sure to return the promise from res.json() so that the next .then waits for it
                  .then(projData => {
                    const div = document.createElement('div'); //makes main holder for the card, which will be resized to fit the image

                    const mediaPath = '/' + project.path + projData.thumb.src;

                    const sizes = ['small', 'medium', 'small','medium','large']; //dumb thing to ensure variety 
                    const size = sizes[Math.floor(Math.random() * sizes.length)];
                    
                    //actual html for the card. The image is loaded first, then the card is resized to fit it. This prevents the grid from breaking when images of different sizes are loaded in.
                    div.innerHTML = `
                        <div class="card ${size}">
                            <a href="/project.html?proj=${project.slug}">

                                <img src="${mediaPath}" alt="${projData.title}" class="thumbnail"/>

                                <div class="overlay">
                                    <div class="overlayText">
                                        <h3>${projData.title}</h3>
                                        
                                    </div>
                                </div>
                            </a>
                        </div>
                            
                        
                        
                    `;
                    //add the card to the container, then find the image inside it and add an onload listener to resize the card once the image is loaded
                    container.appendChild(div);

                    const img = div.querySelector('img');
                    img.onload = () => {
                        requestAnimationFrame(() => resizeGridItem(div));
                    };
                  });
            });
        });
}

// Called on project page to load the project data and display it
function loadProject() {
    // Get the project slug from the URL query parameters
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('proj');

    if(!slug){
        console.error("No project slug in URL");
    }
    //grabs that project's data from the projects.json file, then uses the path property to find the project's data.json file and load that. Then uses all that data to populate the project page.
    fetch('/data/projects.json')
      .then(res => res.json())
      .then(data => {
        let foundProject;

        data.categories.forEach(cat => {
            cat.projects.forEach(p => {
                if (p.slug === slug) {
                    foundProject = p;
                }
            });
        });

        const basePath = '/' + foundProject.path;
        

        fetch(basePath + 'data.json')
          .then(res => res.json())
          .then(projData => {
            const container = document.getElementById('project');

            let mediaHTML = '';
            //media handling. If it's a video, create a video element, otherwise create an image element. This is for the main media at the top of the project page, not the gallery/previs items further down.
            if(projData.main.type === 'video') {
                mediaHTML = `<video controls autoplay src="${basePath + projData.main.src}" alt="${projData.main.alt || ''}"/>`;
            } else {
                mediaHTML = `<img src="${basePath + projData.main.src}" class="thumb" data-lightbox />`;
            }

            // if there's a repo link, create a GitHub icon that links to it. Otherwise, leave it blank.
            repoHTML = '';
            if(projData.repo) {
                repoHTML = `<a href="${projData.repo}" target="_blank"><img src="/_branding/github-icon.jpg" alt="GitHub" width="64" height="64"></a>`;
            }

            // for gallery images and previs, we do the same thing as the main media, but we also wrap them in a div with a class of galleryItem and add an overlay with the alt text. 
            // This is because these images are smaller and there may be multiple of them, so we want to provide more context about what they are.
            galleryHTML = '';
            if (projData.gallery && projData.gallery.length > 0) {
                galleryHTML = '<div class="gallery">';
                projData.gallery.forEach(item => {
                    if(item.type === 'video') {
                        galleryHTML += `<video controls src="${basePath + item.src}" alt="${item.alt || ''}"/>`;
                    } else {
                        galleryHTML += `
                            <div class="galleryItem">
                                <img src="${basePath + item.src}" class="thumb" alt="${item.alt || ''}" data-lightbox/>
                                <div class="galleryOverlay">
                                    <div class="galleryText">${item.alt || ''}</div>
                                </div>
                            </div>
                        `;
                    }

                });
                galleryHTML += '</div>';
            }
            previsHTML = '';
            if (projData.previs && projData.previs.length > 0) {
                previsHTML = '<div class="previs">';

                projData.previs.forEach(item => {
                    if(item.type === 'video') {
                        previsHTML += `<video controls src="${basePath + item.src}" alt="${item.alt || ''}"/>`;
                    } else {
                        previsHTML += `
                            <div class="galleryItem">
                                <img src="${basePath + item.src}" class="thumb" data-lightbox alt="${item.alt || ''}"/>
                                <div class="galleryOverlay">
                                    <div class="galleryText">${item.alt || ''}</div>
                                </div>
                            </div>
                        `;
                    }
                });
                previsHTML += '</div>';
            }

            //if you want to change project page layout, this is where you would do it. Just be sure to include the mediaHTML, repoHTML, galleryHTML, and previsHTML variables somewhere in the layout so that they get displayed.
            container.innerHTML = `
                <div class="projectHeader">
                    <h2 >${projData.title}</h2>
                    <p class="date">${projData.date}</p>
                </div>
                ${repoHTML}

                <div class="mainMedia">
                    ${mediaHTML}
                </div>

                <h3 class = "description">${projData.description}</h3>
                ${galleryHTML}
                <div class="process">
                    <p>${projData.process}</p>
                </div>
                <div class="process">
                    ${previsHTML}
                </div>
            `;
            
          });
      });
}

// Called on category page to resize a card to fit its image. This is necessary because the grid layout can break if images of different sizes are loaded in without resizing the cards to fit them.
function resizeGridItem(item) {
    const grid = document.getElementById('projects');

    const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

    
    const height = item.getBoundingClientRect().height;

    const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = "span "+rowSpan;
}

// Utility function to load HTML components into the page. Called in project.html to load the header and footer.
function loadComponent(id,path){
    fetch(path)
        .then(res=>res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
        })
        .catch(err=>console.error(`Failed to load ${path}:`, err));
}

// DONT TOUCH FROM THIS POINT DOWN UNLESS YOU KNOW WHAT YOU'RE DOING. 
// This is for the lightbox functionality on the project page, which allows you to click on any image with the data-lightbox attribute and have it open in a full-screen overlay. 
// It also allows you to close the lightbox by clicking outside the image or pressing the Escape key.
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    lightbox.style.display = 'flex';
}
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}

window.addEventListener('resize', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const img = card.querySelector('img');

        if(img.complete) {
            resizeGridItem(card);
        }
    });
});

window.addEventListener('load', () => {
    document.querySelectorAll('.card').forEach(resizeGridItem);
});

document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');

    lightbox.addEventListener('click', (e) => {
        if(e.target.id === 'lightbox' || e.target.id === 'lightbox-img') {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeLightbox();
        }
    });
    document.addEventListener('click', (e) => {
        const img = e.target.closest ('img[data-lightbox]');
        console.log('clicked element:', e.target);
        console.log('clicked', img.getAttribute('src'));
        if(!img) return;
        openLightbox(img.getAttribute('src'));
        
    });
    // document.addEventListener('click', (e) => {
    //     console.log('ANY CLICK detected');
    // });
});
