## [0.23.7](https://github.com/kmendell/svelocker-ui/compare/v0.23.6...v0.23.7) (2025-02-28)

### Bug Fixes

* last synced label not updating per repo ([f356075](https://github.com/kmendell/svelocker-ui/commit/f3560757a3e4ef8438baee7557bc6ab081e36512))
* remove un-need sync function ([bfc36fd](https://github.com/kmendell/svelocker-ui/commit/bfc36fd7fdb3d20938323c5a244217ef5c0d40ee))
* **sync:** repo and images delta sync not working ([ded4144](https://github.com/kmendell/svelocker-ui/commit/ded41446de431ddba0138e536689ac55e79c9e2e))
## [0.23.6](https://github.com/kmendell/svelocker-ui/compare/v0.23.5...v0.23.6) (2025-02-28)

### Features

* **details:** add copy run command button ([#93](https://github.com/kmendell/svelocker-ui/issues/93)) ([d702b8f](https://github.com/kmendell/svelocker-ui/commit/d702b8f013032792f1bf0f5a0a06c910ca6e4625))
* **tags:** add limit of 50 tags to be fetched by default ([#94](https://github.com/kmendell/svelocker-ui/issues/94)) ([8a7657c](https://github.com/kmendell/svelocker-ui/commit/8a7657cf11f52c12a07460dce6c30c58efaf8489))

### Bug Fixes

* browser tab title not correct on details page reload ([c4660f9](https://github.com/kmendell/svelocker-ui/commit/c4660f929ad123d1c67920ec512657c446e9a261))
* change tags/manifest logs to debug only ([18a85e2](https://github.com/kmendell/svelocker-ui/commit/18a85e26db71b47ea08650d37399f719b1861cf6))
* **reactive-reload:** make sure repo cards get updated on resync ([#92](https://github.com/kmendell/svelocker-ui/issues/92)) ([8ee1b17](https://github.com/kmendell/svelocker-ui/commit/8ee1b17a2922c655dd3374565c37fb683786f35b))
* **tag-dropdown:** no tags found label ([#91](https://github.com/kmendell/svelocker-ui/issues/91)) ([fe7d19c](https://github.com/kmendell/svelocker-ui/commit/fe7d19c353df6e94db268e25b70aee4769cf47fe))
## [0.23.5](https://github.com/kmendell/svelocker-ui/compare/v0.23.4...v0.23.5) (2025-02-27)

### Features

* add default namespace badge ([87c9807](https://github.com/kmendell/svelocker-ui/commit/87c98074b1cf1e4538286345d2f4be9ec6e79738))
* add last synced label to RepoCard ([b2b02fe](https://github.com/kmendell/svelocker-ui/commit/b2b02fef31025c75a533255f3844b1ebc81d7a4a))

### Bug Fixes

* database rework/memory issues ([#84](https://github.com/kmendell/svelocker-ui/issues/84)) ([c89b851](https://github.com/kmendell/svelocker-ui/commit/c89b851881abfc62ca8fab92c67bb69ec46e9685))
## [0.23.4](https://github.com/kmendell/svelocker-ui/compare/v0.23.3...v0.23.4) (2025-02-26)

### Bug Fixes

* image retrival refactor ([#71](https://github.com/kmendell/svelocker-ui/issues/71)) ([ff43ee1](https://github.com/kmendell/svelocker-ui/commit/ff43ee164400e544697a54c87af6bf60dc18ccd9))
## [0.23.3](https://github.com/kmendell/svelocker-ui/compare/v0.23.2...v0.23.3) (2025-02-24)

### Bug Fixes

* db migration for new database issues ([eba53e7](https://github.com/kmendell/svelocker-ui/commit/eba53e72843a9266e4cbf1bbe1497161ffda53c7))
* deletion logic for all manifest types ([#67](https://github.com/kmendell/svelocker-ui/issues/67)) ([ee58043](https://github.com/kmendell/svelocker-ui/commit/ee5804398452baaa7bfa1b75f9fd768cfa6e5a76))
## [0.23.2](https://github.com/kmendell/svelocker-ui/compare/v0.23.1...v0.23.2) (2025-02-23)

### Bug Fixes

* oci image size metadata ([5b6e129](https://github.com/kmendell/svelocker-ui/commit/5b6e129ffb470b92513d7849f80555c8991e548b))
* remove debug logs for registry health ([717f5c0](https://github.com/kmendell/svelocker-ui/commit/717f5c0ef31d1c647d190aca574cc0b87391f461))
## [0.23.1](https://github.com/kmendell/svelocker-ui/compare/v0.23.0...v0.23.1) (2025-02-23)

### Bug Fixes

* allow for images without a namespace ([#62](https://github.com/kmendell/svelocker-ui/issues/62)) ([0b6e17c](https://github.com/kmendell/svelocker-ui/commit/0b6e17c9a8f59ca121e33ee4deb4634a12b9707b))
* make sure null types are handled ([61e53dc](https://github.com/kmendell/svelocker-ui/commit/61e53dcb23dfad0886814db5fd159ccea0caef29))
* oci manifest types retrival ([#61](https://github.com/kmendell/svelocker-ui/issues/61)) ([f77eaa2](https://github.com/kmendell/svelocker-ui/commit/f77eaa2f63f92ef8fecfdc098010fcfd1a3eca89))
* update tag return values ([74402f0](https://github.com/kmendell/svelocker-ui/commit/74402f08c9cee7f2d04b8db7fc8d2a6c04324037))
## [0.23.0](https://github.com/kmendell/svelocker-ui/compare/v0.22.4...v0.23.0) (2025-02-23)

### Features

* add registry health/api version check ([#53](https://github.com/kmendell/svelocker-ui/issues/53)) ([c6456ba](https://github.com/kmendell/svelocker-ui/commit/c6456ba7e7d988e576cd8bb7727ede768149462a))
## [0.22.4](https://github.com/kmendell/svelocker-ui/compare/v0.22.3...v0.22.4) (2025-02-22)

### Bug Fixes

* add auth headers to delete endpoint ([ebabed1](https://github.com/kmendell/svelocker-ui/commit/ebabed137b77eb9d625d06a9a8f559c34d3274ed))
* add curl to docker image for health check ([194e7b3](https://github.com/kmendell/svelocker-ui/commit/194e7b34e0acec153d8683defdb95ac029aa808f))
## [0.22.3](https://github.com/kmendell/svelocker-ui/compare/v0.22.2...v0.22.3) (2025-02-22)

### Features

* add docker healtheck endpoint ([#50](https://github.com/kmendell/svelocker-ui/issues/50)) ([bf62263](https://github.com/kmendell/svelocker-ui/commit/bf6226319e00c6c6da37717042cf16abcfabf8fe))
## [0.22.2](https://github.com/kmendell/svelocker-ui/compare/v0.22.1...v0.22.2) (2025-02-22)

### Bug Fixes

* basic-auth for registry if enabled ([ea2cfc6](https://github.com/kmendell/svelocker-ui/commit/ea2cfc6b16808985f2b65e293f0a01f0f923dae4))
* change font from roboto to poppins ([c8936a2](https://github.com/kmendell/svelocker-ui/commit/c8936a229175a1d2b6cfc6c15d7145119ba00e0f))
* image name not showing up on details page ([aef598d](https://github.com/kmendell/svelocker-ui/commit/aef598de4136a0e8b48a9bf9f6e183fea5bde986))
## [0.22.1](https://github.com/kmendell/svelocker-ui/compare/v0.22.0...v0.22.1) (2025-02-21)

### Bug Fixes

* add timestamps to sync task log ([8eab5d6](https://github.com/kmendell/svelocker-ui/commit/8eab5d6e0200d5e964fbae3f139942b26ab616c2))
* docker permission issues ([6c945d5](https://github.com/kmendell/svelocker-ui/commit/6c945d59baaac480a2674cae135430f19f2bc93c))
* fix logger for registry sync ([5174efe](https://github.com/kmendell/svelocker-ui/commit/5174efeafec8898498236fe43beaf4d7560cd965))
* public uri when deleting ([d4630fa](https://github.com/kmendell/svelocker-ui/commit/d4630fa43f515acaca2234ed7ba0b99899def6bf))
* update loggin for details page ([2c752cc](https://github.com/kmendell/svelocker-ui/commit/2c752cc9eaddc63249f74c685dc8349948ebb7a1))
* update logging, and backend delete api ([05460ca](https://github.com/kmendell/svelocker-ui/commit/05460ca9126aa16c60a1080e4fbb3b82211af711))
## [0.22.0](https://github.com/kmendell/svelocker-ui/compare/v0.21.0...v0.22.0) (2025-02-20)

### Features

* add sqlite db cache ([#38](https://github.com/kmendell/svelocker-ui/issues/38)) ([3cd944b](https://github.com/kmendell/svelocker-ui/commit/3cd944b762b0a94145ef4c0a06736545be4c2108))

### Bug Fixes

* add registry sync after tag is deleted ([4bc75a2](https://github.com/kmendell/svelocker-ui/commit/4bc75a22e903fa89ab1091c3a00b698a83098235))
* database path if not defined ([f9a40d2](https://github.com/kmendell/svelocker-ui/commit/f9a40d237d97d3d7276a64c531bdcd847061117e))
* delete logic after switch to new db cache ([6338147](https://github.com/kmendell/svelocker-ui/commit/63381471e4606949afa5d3f58e57c5559d2202f7))
* dockerfile database volume auto create ([f078d90](https://github.com/kmendell/svelocker-ui/commit/f078d900007d3f2438264f2115cea66386ca5984))
* pull fresh data after tag is deleted ([cbbb18f](https://github.com/kmendell/svelocker-ui/commit/cbbb18f28266b07d663151295249fbb930b0d98a))
* update default database path if not defined ([3971386](https://github.com/kmendell/svelocker-ui/commit/397138649c50415de15b002a852286a5c8e0dc45))
## [0.21.0](https://github.com/kmendell/svelocker-ui/compare/v0.20.1...v0.21.0) (2025-02-19)

### Features

* image/repo ui/ux refresh ([#33](https://github.com/kmendell/svelocker-ui/issues/33)) ([d63ed72](https://github.com/kmendell/svelocker-ui/commit/d63ed7208b92f40a305bbd16bc98e556459bec19))
## [0.20.1](https://github.com/kmendell/svelocker-ui/compare/v0.20.0...v0.20.1) (2025-02-18)

### Bug Fixes

* add github icon next to version label ([189275d](https://github.com/kmendell/svelocker-ui/commit/189275d90fe62f06ca7a8204c0f1471382a8c088))
* load the ui even if registry is not reachable ([4a75aa5](https://github.com/kmendell/svelocker-ui/commit/4a75aa5eb2d82613a77dda74b71aeb6d2652fdd9))
## [0.20.0](https://github.com/kmendell/svelocker-ui/compare/v0.19.0...v0.20.0) (2025-02-17)

### Features

* add searching for repos/images ([d2488b1](https://github.com/kmendell/svelocker-ui/commit/d2488b1cd685612887e04df9e5dc2bd577794a8d))

### Bug Fixes

* switch background color to musted variant ([48a99ac](https://github.com/kmendell/svelocker-ui/commit/48a99ac7a240581e1111ab4085ed27176c749d44))
## [0.19.0](https://github.com/kmendell/svelocker-ui/compare/v0.18.3...v0.19.0) (2025-02-16)

### Features

* add line numbers to dockerfile contents ([706a042](https://github.com/kmendell/svelocker-ui/commit/706a042f5d0fc315450937d6969b6014b929f453))

### Bug Fixes

* header text not following css rules ([56f736e](https://github.com/kmendell/svelocker-ui/commit/56f736edec5cb1fcab9373178f5e7b6b2968f54e))
* latest version badge spacing wrong ([71d4d0b](https://github.com/kmendell/svelocker-ui/commit/71d4d0b3d8658b5c307a605629cb920392195733))
* version text hard to read ([3223182](https://github.com/kmendell/svelocker-ui/commit/322318216c91e27177e2b8c85227468205194ae4))
## [0.18.3](https://github.com/kmendell/svelocker-ui/compare/v0.18.2...v0.18.3) (2025-02-16)

### Bug Fixes

* dockerfile pre tag indentations ([e5b59d5](https://github.com/kmendell/svelocker-ui/commit/e5b59d5024dbf2e63554a15c5d875b8f156cc0b6))
## [0.18.2](https://github.com/kmendell/svelocker-ui/compare/v0.18.1...v0.18.2) (2025-02-15)

### Bug Fixes

* copy dockerfile button border missing ([0e90831](https://github.com/kmendell/svelocker-ui/commit/0e9083102cf5161bc2418f1a8a2ab82ab14d08ed))
* make sure light/dark mode both work using mode watcher ([5b0a3b9](https://github.com/kmendell/svelocker-ui/commit/5b0a3b901ef08f460bb574fe3ca1a8eabea244f1))
* text mismatch when only 1 tag was found ([6af5c6a](https://github.com/kmendell/svelocker-ui/commit/6af5c6a41b9bef9030bbf76c21d719a2eab1af38))
## [0.18.1](https://github.com/kmendell/svelocker-ui/compare/v0.18.0...v0.18.1) (2025-02-15)

### Bug Fixes

* change font and toast messages in dockerfile dialog ([09c83e4](https://github.com/kmendell/svelocker-ui/commit/09c83e4dc8ba85071312486f317c476ce88c447c))
* change header text to 'found' ([6732df8](https://github.com/kmendell/svelocker-ui/commit/6732df8164e19a39ff46906dfc7cc19f4f3df743))
* change repo api call to axios ([397eb92](https://github.com/kmendell/svelocker-ui/commit/397eb92dc1b9b470ffad09f39158dfd99e112b98))
* chnage make items per page to 5 ([fd788b7](https://github.com/kmendell/svelocker-ui/commit/fd788b7b95bc7d1c78da46edf2cbcaeb953ba329))
* latest tag button cause margin issues if theres only one tag ([75c991e](https://github.com/kmendell/svelocker-ui/commit/75c991ecc8ccde6d3cf4baf74c61be59930c6ce9))
* optional channing for dockerFileContents ([7e0e7c8](https://github.com/kmendell/svelocker-ui/commit/7e0e7c8a57fccb9af489537748640f410baafc6b))
* pagenation grabbing the wrong index for tags/images ([dd24fe7](https://github.com/kmendell/svelocker-ui/commit/dd24fe7a170be1b3458006b9aa59b5a831e9f111))
* remove PageData from obselte pages, and use filteredData ([267b461](https://github.com/kmendell/svelocker-ui/commit/267b461c228ccd3af73a2316f38a63197beb281c))
## [0.18.0](https://github.com/kmendell/svelocker-ui/compare/v0.17.2...v0.18.0) (2025-02-15)

### Features

* add confirm dialog before deleting image/tag ([0810eb2](https://github.com/kmendell/svelocker-ui/commit/0810eb2979f9e376ae75f9248f99469e08d52f8f))
* add confirm dialog before deleting image/tag ([2add5ba](https://github.com/kmendell/svelocker-ui/commit/2add5ba63d527c2f612fee6a88e8e175ebafc3a3))
* add tags count label ([8278cb5](https://github.com/kmendell/svelocker-ui/commit/8278cb554acd1f26740f25b981404dd4b89f7375))
## [0.17.2](https://github.com/kmendell/svelocker-ui/compare/v0.17.1...v0.17.2) (2025-02-15)

### Bug Fixes

* delete image reponse return code ([fcd54ae](https://github.com/kmendell/svelocker-ui/commit/fcd54ae7c6a791647fce84f67152b8c05f8b5061))
## [0.17.1](https://github.com/kmendell/svelocker-ui/compare/v0.17.0...v0.17.1) (2025-02-15)

### Features

* add entrypoint to metadata ([8eb27a0](https://github.com/kmendell/svelocker-ui/commit/8eb27a0b9abbd8077bc609a0f4d70e15f091c4bf))

### Bug Fixes

* make sure data variable is initialized ([24b2be9](https://github.com/kmendell/svelocker-ui/commit/24b2be95c681e79207dcb1d374355a7d9c06be44))
* move api calls to axios over fetch ([bd22c63](https://github.com/kmendell/svelocker-ui/commit/bd22c6397cde0a5c303db87d9d540193c6436f76))
* move delete api call to axios ([992bffe](https://github.com/kmendell/svelocker-ui/commit/992bffef8cde35b19e373dc72528b3e415aa50bc))
## [0.17.0](https://github.com/kmendell/svelocker-ui/compare/v0.16.2...v0.17.0) (2025-02-14)

### Features

* add copy success toast message ([5191a30](https://github.com/kmendell/svelocker-ui/commit/5191a30c565c03085f82e102d40b5886fedc2b24))
* add image deletion ([8a0e8f3](https://github.com/kmendell/svelocker-ui/commit/8a0e8f32c4f91fdcf5e0731035121efff0f9f122))
* add title with repo name and image count ([54741aa](https://github.com/kmendell/svelocker-ui/commit/54741aa249d352eff97bccd223bb179104c189e7))

### Bug Fixes

* add checks for tags retrival ([bf2e252](https://github.com/kmendell/svelocker-ui/commit/bf2e25203d7c92c70bc3e32d1cd874ded2ea409f))
* add more checks if resources are not found ([0310524](https://github.com/kmendell/svelocker-ui/commit/0310524f3da15046bfaff948f9111b7cd5de5ef3))
## [0.16.2](https://github.com/kmendell/svelocker-ui/compare/v0.16.1...v0.16.2) (2025-02-14)

### Bug Fixes

* background color ([b1914b5](https://github.com/kmendell/svelocker-ui/commit/b1914b535551e1accaa213c59393637752694c49))
## [0.16.1](https://github.com/kmendell/svelocker-ui/compare/v0.16.0...v0.16.1) (2025-02-14)
## [0.16.0](https://github.com/kmendell/svelocker-ui/compare/v0.15.0...v0.16.0) (2025-02-14)

### Features

* add description to metadata ([f7b45e0](https://github.com/kmendell/svelocker-ui/commit/f7b45e01101d6314cec5b6834d684960e2b9fa42))
* add pagination ([be3966c](https://github.com/kmendell/svelocker-ui/commit/be3966c72456c5430c3ce419275800d928899c8c))

### Bug Fixes

* float latest tag left ([ea8e0db](https://github.com/kmendell/svelocker-ui/commit/ea8e0db20e1f9955e0c26d285e1a116fb7119f1a))
* make all tag buttons equal size ([8b37fb5](https://github.com/kmendell/svelocker-ui/commit/8b37fb5c1f95bd0b3e1ab87e75500674b2969814))
* use roboto font globally ([8994cb7](https://github.com/kmendell/svelocker-ui/commit/8994cb75edd5edff16187feee9d0b0fc11f857d8))
* version text hover ([b24898e](https://github.com/kmendell/svelocker-ui/commit/b24898e748ba53a3b4aaa7dc855569cb509c768b))
* void return type on copy ([8296b81](https://github.com/kmendell/svelocker-ui/commit/8296b81e6699dd279d722573f8125c9da0c8d9e1))
## [0.15.0](https://github.com/kmendell/svelocker-ui/compare/v0.14.2...v0.15.0) (2025-02-14)

### Features

* add container size to drawer ([ddb791b](https://github.com/kmendell/svelocker-ui/commit/ddb791b0732cf4078754d29861892b98a74f4d90))
* add exposed ports in metadata drawer ([ac6508f](https://github.com/kmendell/svelocker-ui/commit/ac6508f2dfd5f12e2b012d89f0f60f25d6ed16b3))
* add workDirectory and command to drawer ([e3041aa](https://github.com/kmendell/svelocker-ui/commit/e3041aa134ac679add1cea0f1349b3f310e77501))

### Bug Fixes

* show author by specific labels ([41d1b1a](https://github.com/kmendell/svelocker-ui/commit/41d1b1a970d2c632537518826c1bd8a716ea9d04))
## [0.14.2](https://github.com/kmendell/svelocker-ui/compare/v0.14.1...v0.14.2) (2025-02-13)

### Bug Fixes

* use server-side running for dockerfile ([1dee166](https://github.com/kmendell/svelocker-ui/commit/1dee1663778e302080fac1d86c5d3ebd87fc91cd))
## [0.14.1](https://github.com/kmendell/svelocker-ui/compare/v0.14.0...v0.14.1) (2025-02-13)

### Bug Fixes

* use server-side running for docker tags ([ac1ba90](https://github.com/kmendell/svelocker-ui/commit/ac1ba90bc625167f0dd5f72eb08174d951fb63e2))
## [0.14.0](https://github.com/kmendell/svelocker-ui/compare/v0.13.0...v0.14.0) (2025-02-13)

### Features

* run all registry api calls server-side ([cee03ff](https://github.com/kmendell/svelocker-ui/commit/cee03ff7a16a862544a37e8a4f9f65cb26354e8a))
## [0.13.0](https://github.com/kmendell/svelocker-ui/compare/v0.12.1...v0.13.0) (2025-02-13)

### Features

* add copy dockerfile button ([b034931](https://github.com/kmendell/svelocker-ui/commit/b034931c0097c4aa76230b230aa3ec58b352081a))
* add latest version badge to drawer ([6ca13af](https://github.com/kmendell/svelocker-ui/commit/6ca13af1652cc35f940c2a740a8f93e7fb13f4ca))
* add version label in header ([e3b8393](https://github.com/kmendell/svelocker-ui/commit/e3b8393b81d1cccf8571d8899537d2fb3b230dfc))

### Bug Fixes

* disable delte button till feature is added ([fb54c57](https://github.com/kmendell/svelocker-ui/commit/fb54c570dd7605d405ecc98a094aef24902363e2))
## [0.12.1](https://github.com/kmendell/svelocker-ui/compare/v0.12.0...v0.12.1) (2025-02-13)

### Bug Fixes

* restructure time string ([fc3c90a](https://github.com/kmendell/svelocker-ui/commit/fc3c90a572101be241caa1b44d9d3df5fc7a4aab))
## [0.12.0](https://github.com/kmendell/svelocker-ui/compare/v0.11.1...v0.12.0) (2025-02-13)

### Features

* more streamlined drawer ui ([d5469c4](https://github.com/kmendell/svelocker-ui/commit/d5469c400fc74a95e15b181d04a99cbb2261baea))
* view dockerfile from drawer ([66f8b0a](https://github.com/kmendell/svelocker-ui/commit/66f8b0a186de2b1d029d0f92b33942121fa34661))

### Bug Fixes

* page overflow-y, and cursor pointer mismatch ([c061ac8](https://github.com/kmendell/svelocker-ui/commit/c061ac8937236a8f79125522e3b4da61756c8b9b))

## [0.11.1](https://github.com/kmendell/svelocker-ui/compare/v0.11.0...v0.11.1) (2025-02-12)

### Features

* metadata darwer instead of sheet ([872e24e](https://github.com/kmendell/svelocker-ui/commit/872e24e6022f654e45505f7868ac3439e7f04be2))
## [0.11.0](https://github.com/kmendell/svelocker-ui/compare/v0.10.3...v0.11.0) (2025-02-12)

### Features

* add env config ([3b1baaa](https://github.com/kmendell/svelocker-ui/commit/3b1baaa64e2ea0014e752aa3f59e551b768b928f))

### Bug Fixes

* repo name not showing on non latest tags ([2f44549](https://github.com/kmendell/svelocker-ui/commit/2f445494182acf2fcd5d94129490eeb62f9802a6))
## 0.10.3 (2025-02-12)

### Features

- add error message when pulling data failed ([9230de8](https://git.kmcr.cc/kmendell/svelocker/commit/9230de8a9c0de9a8e3539476b8d71c56f5fe8852))
- add listing of tags (static for now will be dynamic) ([7d5b833](https://git.kmcr.cc/kmendell/svelocker/commit/7d5b833c623a521cd3d7a4b42d1b709471f37614))
- docker registry repo/image/tag sync ([c0a209c](https://git.kmcr.cc/kmendell/svelocker/commit/c0a209c013b9238d70e213fb44e649107dc6a3d5))
- update badge with links ([b1ef134](https://git.kmcr.cc/kmendell/svelocker/commit/b1ef1347d101984f31ff1a6c215789db71249908))

### Bug Fixes

- add placeholder counter ([c314cfb](https://git.kmcr.cc/kmendell/svelocker/commit/c314cfbdc7937014d97712ffd090bb8791c2442a))
- css error ([5e8cc6e](https://git.kmcr.cc/kmendell/svelocker/commit/5e8cc6ebb4076fa09a92c9607ece7ec6fca70838))
- disable delete button till functionality is complete ([dc957e9](https://git.kmcr.cc/kmendell/svelocker/commit/dc957e90dd43f3a7006c4806b3c7791c20eba1b8))
- header issues ([081322e](https://git.kmcr.cc/kmendell/svelocker/commit/081322ef043bf7442f548359b6ca78380b86023e))
- header width , also added tag route ([046a052](https://git.kmcr.cc/kmendell/svelocker/commit/046a05273cd78972b6e5b3afd1e65743909ca9d1))
- remove docker version from sheet ([03e157b](https://git.kmcr.cc/kmendell/svelocker/commit/03e157b0695a466f69bfbc60083f2a0dada82308))
- remove un0needed logging ([de0b2cd](https://git.kmcr.cc/kmendell/svelocker/commit/de0b2cd367573ed2176a3e8c458f4651af1d991a))
- repo/image name not showing up on sheet view ([18b98b9](https://git.kmcr.cc/kmendell/svelocker/commit/18b98b9e0d4ba114c76185c59b84802fac452133))

## 0.10.0 (2025-02-12)

### Features

- add error message when pulling data failed ([9230de8](https://git.kmcr.cc/kmendell/svelocker/commit/9230de8a9c0de9a8e3539476b8d71c56f5fe8852))
- add listing of tags (static for now will be dynamic) ([7d5b833](https://git.kmcr.cc/kmendell/svelocker/commit/7d5b833c623a521cd3d7a4b42d1b709471f37614))
- docker registry repo/image/tag sync ([c0a209c](https://git.kmcr.cc/kmendell/svelocker/commit/c0a209c013b9238d70e213fb44e649107dc6a3d5))
- update badge with links ([b1ef134](https://git.kmcr.cc/kmendell/svelocker/commit/b1ef1347d101984f31ff1a6c215789db71249908))

### Bug Fixes

- add placeholder counter ([c314cfb](https://git.kmcr.cc/kmendell/svelocker/commit/c314cfbdc7937014d97712ffd090bb8791c2442a))
- disable delete button till functionality is complete ([dc957e9](https://git.kmcr.cc/kmendell/svelocker/commit/dc957e90dd43f3a7006c4806b3c7791c20eba1b8))
- header issues ([081322e](https://git.kmcr.cc/kmendell/svelocker/commit/081322ef043bf7442f548359b6ca78380b86023e))
- header width , also added tag route ([046a052](https://git.kmcr.cc/kmendell/svelocker/commit/046a05273cd78972b6e5b3afd1e65743909ca9d1))
- remove docker version from sheet ([03e157b](https://git.kmcr.cc/kmendell/svelocker/commit/03e157b0695a466f69bfbc60083f2a0dada82308))
- remove un0needed logging ([de0b2cd](https://git.kmcr.cc/kmendell/svelocker/commit/de0b2cd367573ed2176a3e8c458f4651af1d991a))
- repo/image name not showing up on sheet view ([18b98b9](https://git.kmcr.cc/kmendell/svelocker/commit/18b98b9e0d4ba114c76185c59b84802fac452133))

## 0.10.0 (2025-02-12)

### Features

- add error message when pulling data failed ([9230de8](https://git.kmcr.cc/kmendell/svelocker/commit/9230de8a9c0de9a8e3539476b8d71c56f5fe8852))
- add listing of tags (static for now will be dynamic) ([7d5b833](https://git.kmcr.cc/kmendell/svelocker/commit/7d5b833c623a521cd3d7a4b42d1b709471f37614))
- docker registry repo/image/tag sync ([c0a209c](https://git.kmcr.cc/kmendell/svelocker/commit/c0a209c013b9238d70e213fb44e649107dc6a3d5))
- update badge with links ([b1ef134](https://git.kmcr.cc/kmendell/svelocker/commit/b1ef1347d101984f31ff1a6c215789db71249908))

### Bug Fixes

- add placeholder counter ([c314cfb](https://git.kmcr.cc/kmendell/svelocker/commit/c314cfbdc7937014d97712ffd090bb8791c2442a))
- header issues ([081322e](https://git.kmcr.cc/kmendell/svelocker/commit/081322ef043bf7442f548359b6ca78380b86023e))
- header width , also added tag route ([046a052](https://git.kmcr.cc/kmendell/svelocker/commit/046a05273cd78972b6e5b3afd1e65743909ca9d1))
- remove un0needed logging ([de0b2cd](https://git.kmcr.cc/kmendell/svelocker/commit/de0b2cd367573ed2176a3e8c458f4651af1d991a))
- repo/image name not showing up on sheet view ([18b98b9](https://git.kmcr.cc/kmendell/svelocker/commit/18b98b9e0d4ba114c76185c59b84802fac452133))
