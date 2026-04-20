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

                    div.innerHTML = `
                        <div class="card">
                            <a href="/project.html?proj=${project.slug}">

                                <img src="${mediaPath}" alt="${projData.title}" class="thumbnail"/>

                                <div class="overlay">
                                    <div class="overlayText">
                                        <h3>${projData.title}</h3>
                                        <p>${projData.description}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                            
                        
                        
                    `;

                    container.appendChild(div);

                    const img = div.querySelector('img');
                    img.onload = () => resizeGridItem(div);
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

            if(projData.type === 'video') {
                mediaHTML = `<video controls src="${basePath + projData.main.src}" />`;
            } else {
                mediaHTML = `<img src="${basePath + projData.main.src}" />`;
            }

            galleryHTML = '';
            if (projData.gallery && projData.gallery.length > 0) {
                galleryHTML = '<div class="gallery">';

                projData.gallery.forEach(item => {
                    if(item.type === 'video') {
                        galleryHTML += `<video controls src="${basePath + item.src}" />`;
                    } else {
                        galleryHTML += `<img src="${basePath + item.src}" />`;
                    }
                });
                galleryHTML += '</div>';
            }
            previsHTML = '';
            if (projData.previs && projData.previs.length > 0) {
                previsHTML = '<div class="previs"><h2>Previsualization</h2>';

                projData.previs.forEach(item => {
                    if(item.type === 'video') {
                        previsHTML += `<video controls src="${basePath + item.src}" />`;
                    } else {
                        previsHTML += `<img src="${basePath + item.src}" />`;
                    }
                });
                previsHTML += '</div>';
            }

            container.innerHTML = `
                <h1>${projData.title}</h1>
                <p class="date">${projData.date}</p>

                <div class="mainMedia">
                    ${mediaHTML}
                </div>

                <h3 class = "description">${projData.description}</h3>
                ${galleryHTML}
                <div class="process">
                    <h2>Process</h2>
                    <p>${projData.process}</p>
                </div>
                
                ${previsHTML}
                `;
            
          });
      });
}

function resizeGridItem(item) {
    const grid = document.getElementById('projects');

    const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

    const img = item.querySelector('.thumbnail');
    const height = img.getBoundingClientRect().height;

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