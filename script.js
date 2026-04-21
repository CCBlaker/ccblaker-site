function loadCategory(categorySlug) {
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(data => {
            const category = data.categories.find(c => c.slug === categorySlug);
            const container = document.getElementById('projects');
            const images = [];
            category.projects.forEach(project => {
                fetch('/' + project.path + 'data.json')
                  .then(res => res.json())
                  .then(projData => {
                    images.push({
                        src: '/' + project.path + projData.thumb.src,
                        slug: project.slug
                    });

                    if(images.length === category.projects.length) {
                        buildJustifiedGallery(images, 'projects', 250);
                    }
                    // const div = document.createElement('div');

                    // const mediaPath = '/' + project.path + projData.thumb.src;

                    // div.innerHTML = `
                    //     <div class="card">
                    //         <a href="/project.html?proj=${project.slug}">

                    //             <img src="${mediaPath}" alt="${projData.title}" class="thumbnail"/>

                    //             <div class="overlay">
                    //                 <div class="overlayText">
                    //                     <h3>${projData.title}</h3>
                                        
                    //                 </div>
                    //             </div>
                    //         </a>
                    //     </div>
                            
                        
                        
                    // `;

                    // container.appendChild(div);

                    // const img = div.querySelector('img');
                    // img.onload = () => {
                    //     requestAnimationFrame(() => resizeGridItem(div));
                    // };
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
                mediaHTML = `<video controls src="${basePath + projData.main.src}" />`;
            } else {
                mediaHTML = `<img src="${basePath + projData.main.src}" />`;
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
                        galleryHTML += `<video controls src="${basePath + item.src}" />`;
                    } else {
                        galleryHTML += `<img src="${basePath + item.src}" />`;
                    }
                });
                galleryHTML += '</div>';
            }
            previsHTML = '';
            if (projData.previs && projData.previs.length > 0) {
                previsHTML = '<div class="previs">';

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
                <h2 style="text-align: left">${projData.title}</h2>
                <p style="text-align: left" class="date">${projData.date}</p>
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

// function resizeGridItem(item) {
//     const grid = document.getElementById('projects');

//     const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
//     const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

    
//     const height = item.getBoundingClientRect().height;

//     const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));
//     item.style.gridRowEnd = "span "+rowSpan;
// }

function loadComponent(id,path){
    fetch(path)
        .then(res=>res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
        })
        .catch(err=>console.error(`Failed to load ${path}:`, err));
}

function buildJustifiedGallery(projects, containerId, targetRowHeight = 250) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear existing content

    let currentRow = [];
    let currentWidth = 0;

    const containerWidth = container.clientWidth;

    projects.forEach((proj, index) => {
        const img = new Image();
        img.src = proj.src;

        img.onload = () => {
            const aspect = img.width / img.height;

            currentRow.push({proj, aspect, img});
            currentWidth += aspect * targetRowHeight;

            if (currentWidth >= containerWidth || index === projects.length - 1) {
                const scale = containerWidth / currentWidth;

                const row = document.createElement('div');
                row.classList.add('row');
                row.style.height = `${targetRowHeight * scale}px`;

                currentRow.forEach(item => {
                    const div = document.createElement('div');
                    div.classList.add('card');

                    div.style.flex = `0 0 ${item.aspect * targetRowHeight * scale}px`;

                    const image = document.createElement('img');
                    image.src = item.proj.src;

                    div.appendChild(image);
                    row.appendChild(div);
                });

                container.appendChild(row);

                currentRow = [];
                currentWidth = 0;
            }
        };
    });
}
// window.addEventListener('resize', () => {
//     const cards = document.querySelectorAll('.card');
//     cards.forEach(card => {
//         const img = card.querySelector('img');

//         if(img.complete) {
//             resizeGridItem(card);
//         }
//     });
// });

// window.addEventListener('load', () => {
//     document.querySelectorAll('.card').forEach(resizeGridItem);
// });