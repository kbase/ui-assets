.PHONY: serve down

image_name = kbase-ui-assets

serve:
	docker build . -t $(image_name)
	docker run -it -v $(PWD)/assets:/www/data/ -p 127.0.0.1:8080:80 $(image_name)

down:
	docker rmi -f $(image_name)
	docker container prune
