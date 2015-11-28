import __fetch from "isomorphic-fetch";
import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "react-transmit";
import Canvas from './Canvas';

/**
 * Main React application entry-point for both the server and client.
 */
class Main extends React.Component {
	/**
	 * Runs on server and client.
	 */

	componentWillMount () {
		if (__SERVER__) {
			/**
			 * This is only run on the server, and will be removed from the client build.
			 */
			console.log("Hello server");
		}

		if (__CLIENT__) {
			/**
			 * This is only run on the client.
			 */
			console.log("Hello client");

			/**
			 * Recursive function to transmit the rest of the stargazers on the client.
			 */

		}
	}

	/**
	 * Runs on server and client.
	 */
	render () {
		const repositoryUrl = "https://github.com/RickWong/react-isomorphic-starterkit";
		const avatarSize    = 32;
		const avatarUrl     = (id) => `https://avatars.githubusercontent.com/u/${id}?v=3&s=${avatarSize}`;

		/**
		 * This is a Transmit fragment.
		 */
		const {stargazers} = this.props;

		return (
			<InlineCss stylesheet={Main.css(avatarSize)} namespace="Main">
				<Canvas></Canvas>



			</InlineCss>
		);
	}
	/**
	 * <InlineCss> component allows you to write a CSS stylesheet for your component. Target
	 * your component with `&` and its children with `& selectors`. Be specific.
	 */
	static css (avatarSize) {
		return (`
			& .github {
				position: absolute;
				top: 0;
				right: 0;
				border: 0;
			}
			& {
				font-family: sans-serif;
				color: #333333;
				padding: 10px 30px 30px;

				margin: 10px auto;
				background: #ffffff;
			}

		`);
	}

}

/**
 * Use Transmit to query and return GitHub stargazers as a Promise.
 */
export default Transmit.createContainer(Main, {
	initialVariables: {
		nextPage:       1,
		pagesToFetch:   15,
		prevStargazers: []
	},
	fragments: {
		/**
		 * Return a Promise of the previous stargazers + the newly fetched stargazers.
		 */
		stargazers ({nextPage, pagesToFetch, prevStargazers}) {
			/**
			 * On the server, connect to GitHub directly.
			 */
			let githubApi = "https://api.github.com";

			/**
			 * On the client, connect to GitHub via the proxy route.
			 */
			if (__CLIENT__) {
				const {hostname, port} = window.location;
				githubApi = `http://${hostname}:${port}/api/github`;
			}

			/**
			 * Load a few stargazers using the Fetch API.
			 */
			return fetch(
				githubApi + "/repos/RickWong/react-isomorphic-starterkit/stargazers" +
				`?per_page=100&page=${nextPage}`
			).then((response) => response.json())
			.then((body) => {
				/**
				 * Stop fetching if the response body is empty.
				 */
				if (!body || !body.length) {
					pagesToFetch = 0;

					return prevStargazers;
				}

				/**
				 * Pick id and username from fetched stargazers.
				 */
				const fechedStargazers = body.map(({id, login}) => ({id, login}));

				return prevStargazers.concat(fechedStargazers);
			}).catch((error) => {
				console.error(error);
			});
		}
	}
});

