function loadCategory(categorySlug) {
    fetch('data/projects.json')
        .then(res => res.json())
        .then(data => {
            const category = data.categories.find(c => c.slug === categorySlug);
            const container = document.getElementById('projects');

            category.projects.forEach(project => {
                const div = document.createElement('div');

                div.innerHTML = `
                    <h3>${project.title}</h3>
                    <a href="project.html?proj=${project.slug}">
                        View Project
                    </a>
                `;

                container.appendChild(div);
            });
        });
}