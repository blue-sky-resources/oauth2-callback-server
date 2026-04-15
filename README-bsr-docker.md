# Building and deploying the Docker image

### One-time setup
Note, you need to have `gcloud` installed and be logged into Google Cloud.  Then you need to have Docker configured to use `gcloud` as an auth helper:
```sh
gcloud auth configure-docker gcr.io
```

### Build the image
```sh
docker build -t gcr.io/my-blue-sky-development/blueskyresources/oauth2-callback-server .
```

### Deploy the image
```sh
docker push gcr.io/my-blue-sky-development/blueskyresources/oauth2-callback-server
```
