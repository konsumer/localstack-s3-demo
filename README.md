# locastack-s3-demo

This is signed-url S3 uploader. It's deployed [here](https://localstack-s3-demo.vercel.app/).


## development

* It's using [localstack](https://github.com/localstack/localstack) to simulate AWS locally.
* It uses cloudformation to define resources
* It uses vercel to deploy it

```sh
npm i          # install local tools
npm start      # run a development-server
npm run deploy # deploy on vercel
```

You can edit local environment-variables in `.env` and on deploy settings will be pushed to vercel.