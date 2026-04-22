function loadCategory(categorySlug) {
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(data => {
            const category = data.categories.find(c => c.slug === categorySlug);
            const container = document.getElementById('projects');

            category.projects.forEach(project => {
                fetch('/' + project.path + 'data.json')
                  .then(res => res.json())
                  .then(projData => {
                    const div = document.createElement('div');

                    const mediaPath = '/' + project.path + projData.thumb.src;

                    const sizes = ['small', 'medium', 'small','medium','large'];
                    const size = sizes[Math.floor(Math.random() * sizes.length)];
                    
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
                    
                    container.appendChild(div);

                    const img = div.querySelector('img');
                    img.onload = () => {
                        requestAnimationFrame(() => resizeGridItem(div));
                    };
                  });
            });
        });
}


function loadProject() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('proj');

    if(!slug){
        console.error("No project slug in URL");
    }

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

            if(projData.main.type === 'video') {
                mediaHTML = `<video controls src="${basePath + projData.main.src}" alt="${projData.main.alt || ''}"/>`;
            } else {
                mediaHTML = `<img src="${basePath + projData.main.src}" class="thumb" data-lightbox />`;
            }

            repoHTML = '';
            if(projData.repo) {
                repoHTML = `<a href="${projData.repo}" target="_blank"><img src="/_branding/github-icon.jpg" alt="GitHub" width="64" height="64"></a>`;
            }

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

function resizeGridItem(item) {
    const grid = document.getElementById('projects');

    const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

    
    const height = item.getBoundingClientRect().height;

    const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = "span "+rowSpan;
}

function loadComponent(id,path){
    fetch(path)
        .then(res=>res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
        })
        .catch(err=>console.error(`Failed to load ${path}:`, err));
}

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
