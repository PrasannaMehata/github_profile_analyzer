 <script>
        let langChartInstance = null;

        async function analyze() {
            const username = document.getElementById("username").value.trim();
            if (!username) {
                alert("Please enter a GitHub username!");
                return;
            }

            try {
                // Fetch basic user info
                const userRes = await fetch(`https://api.github.com/users/${username}`);
                if (!userRes.ok) throw new Error("User not found");
                const userData = await userRes.json();

                // Fetch user repos
                const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
                const repos = await reposRes.json();

                let totalStars = 0;
                let totalForks = 0;
                const languages = {};

                for (const repo of repos) {
                    totalStars += repo.stargazers_count;
                    totalForks += repo.forks_count;

                    const langRes = await fetch(repo.languages_url);
                    const langData = await langRes.json();

                    for (const [lang, bytes] of Object.entries(langData)) {
                        languages[lang] = (languages[lang] || 0) + bytes;
                    }
                }

                const rating = ((totalStars + totalForks) / (repos.length || 1)).toFixed(2);

                // Update profile UI
                document.getElementById("profile").style.display = 'block';
                document.getElementById("avatar").src = userData.avatar_url;
                document.getElementById("name").textContent = userData.name || username;
                document.getElementById("repos").textContent = userData.public_repos;
                document.getElementById("stars").textContent = totalStars;
                document.getElementById("forks").textContent = totalForks;
                document.getElementById("rating").textContent = rating;

                // Draw chart
                const ctx = document.getElementById('langChart').getContext('2d');
                if (langChartInstance) langChartInstance.destroy();

                langChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(languages),
                        datasets: [{
                            label: 'Language Usage',
                            data: Object.values(languages),
                            backgroundColor: [
                                '#36a2eb',
                                '#ff6384',
                                '#ffce56',
                                '#4bc0c0',
                                '#9966ff',
                                '#ff9f40',
                                '#c9cbcf'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: true, text: 'Programming Language Breakdown' }
                        }
                    }
                });

            } catch (err) {
                alert("Error: " + err.message);
                console.error(err);
            }
        }
    </script>
