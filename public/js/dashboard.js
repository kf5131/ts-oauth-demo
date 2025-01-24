async function fetchRepositories() {
    try {
        const response = await fetch('/api/repos');
        const repos = await response.json();
        
        const reposDiv = document.getElementById('repos');
        repos.forEach(repo => {
            const repoElement = document.createElement('div');
            repoElement.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description'}</p>
                <a href="${repo.html_url}" target="_blank">View on GitHub</a>
                <hr>
            `;
            reposDiv.appendChild(repoElement);
        });
    } catch (error) {
        console.error('Error fetching repositories:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchRepositories); 