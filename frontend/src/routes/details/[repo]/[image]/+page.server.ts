import { ImageService } from '$lib/services/image-service';

export async function load({ params }) {
	const imageService = ImageService.getInstance();
	const repoName = params.repo;
	const imageName = params.image;

	const imageResponse = await imageService.getImage(repoName, imageName);

	console.log('Image data received:', imageResponse);
	return {
		image: imageResponse,
		repoName,
		imageName
	};
}
