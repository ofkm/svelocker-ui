interface RegistryRepos {
	repos: string[];
}

const jsonString = '{"repositories":["kmendell/pocket-id","ofkm/caddy","ofkm/pocket-id"]}';
const data: Repos = JSON.parse(jsonString);