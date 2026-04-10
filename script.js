function loadCategory(categorySlug) {
    fetch('/data/projects.json')
        .then(res => res.json())
        .then(text => {
            console.log(text);
        })
        .then(data => {
            const category = data.categories.find(c => c.slug === categorySlug);
            const container = document.getElementById('projects');

            category.projects.forEach(project => {
                fetch('../' + project.path + 'data.json')
                  .then(res => res.json())
                  .then(projData => {
                    const div = document.createElement('div');

                    const mediaPath = '../' + project.path + projData.media;

                    div.innerHTML = `
                        <div class="card">
                            
                            <div class="container">
                                
                                <a href="/project.html?proj=${project.slug}">
                                    <img src="${mediaPath}" alt="${project.alt} class="thumbnail"/>
                                </a>
                            </div>
                        </div>
                        
                    `;

                    container.appendChild(div);
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

    fetch('../data/projects.json')
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

        const basePath = '../' + foundProject.path;

        fetch(basePath + 'data.json')
          .then(res => res.json())
          .then(projData => {
            const container = document.getElementById('project');

            let mediaHTML = '';

            if(projData.type === 'video') {
                mediaHTML = `<video controls src="${basePath + projData.media}" />`;
            } else {
                mediaHTML = `<img src="${basePath + projData.media}" />`;
            }

            container.innerHTML = `
                <h1>${projData.title}</h1>
                ${mediaHTML}
                <p>${projData.description}</p>
            `;
          });
      });
}