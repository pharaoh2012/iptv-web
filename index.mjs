import fs from 'fs';
async function main() {
    fs.mkdirSync("./docs/img",{recursive: true});
    fetch("https://getproxy.deno.dev/?url=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fpharaoh2012%2Fiptv-api%2Foutput%2Fuser_result.txt").then(res=>res.text()).then(res=>{
        let urls = res.split("\n").filter(item=>{
            if(item.includes("#genre#")) return false;
            if(item.includes(",")) return true;
            return false;
        }).map((item,index)=>{
            let arr = item.trim().split(",");
            return {
                name: arr[0],
                url: arr[1].split("$")[0],
                index: index
            }
        });
        fs.writeFileSync("./docs/urls.json",JSON.stringify(urls));
        console.log(urls);
        const cmds = urls.map((item,index)=>{
            return `echo 🎞🎞[${index+1}/${urls.length}] ${item.name} ${item.url}\necho ffmpeg -timeout 10000000 -headers "timeout=10" -i "${item.url}" -vf "select=eq(n\\,0)" -q:v 2 -y "docs/img/${item.index}.jpg" -frames:v 1 \nffmpeg -timeout 10000000 -headers "timeout=10" -i "${item.url}" -vf "select=eq(n\\,0)" -q:v 2 -y "docs/img/${item.index}.jpg" -frames:v 1\nffmpeg -i "docs/img/${item.index}.jpg" -vf "scale=iw*0.2:ih*0.2" -y "docs/img/${item.index}_thumbnail.jpg"`
        })
        fs.writeFileSync("index.sh",cmds.join("\n"));
    });
}

main();