sample regex.conf:
-[
{
        "host": "example",
        "page": "test",
        "content": null,
        "contentType": "text/"
}
]-

Rules:
 * host: skip all non-matching hosts (tested on "<hostname>:<port>" (eg. "www.example.com:8080"))
 * page: non-matching pages won't be downloaded, followed and indexed (tested on the page (eg. "/folder/page?qs=1"))
 * contentType: non-matching pages won't be downloaded, followed and indexed (tested on the HTTP header "content-type" (eg. "application/pdf"))
 * content: pages with non-matching content won't be indexed (tested on page content only when "content-type" starts with "text/")

NOTE: regular expression are case-insensitive
