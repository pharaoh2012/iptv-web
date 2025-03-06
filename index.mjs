import fs from 'fs';
// sequentialExec.mjs
import { exec } from 'child_process';

// 将 exec 包装为返回 Promise 的函数
function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve(`执行错误: ${error.message}`);
                return;
            }
            if (stderr) {
                resolve(`标准错误输出: ${stderr}`);
                return;
            }
            console.log(`标准输出:\n${stdout}`);
            resolve(stdout);
        });
    });
}
async function main() {
    fs.mkdirSync("./docs/img", { recursive: true });
    const res = await fetch("https://getproxy.deno.dev/?url=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fpharaoh2012%2Fiptv-api%2Foutput%2Fuser_result.txt").then(res => res.text());

    let urls = res.split("\n").filter(item => {
        if (item.includes("#genre#")) return false;
        if (item.includes(",")) return true;
        return false;
    }).map((item, index) => {
        let arr = item.trim().split(",");
        return {
            name: arr[0],
            url: arr[1].split("$")[0],
            index: index
        }
    });
    fs.writeFileSync("./docs/urls.json", JSON.stringify(urls));
    // console.log(urls);
    for (let i = 0; i < urls.length; i++) {
        const item = urls[i];
        console.log(`🎞🎞[${i + 1}/${urls.length}] ${item.name} ${item.url}`);
        console.log(`ffmpeg -i "${item.url}" -vf "select='eq(pict_type,I)',setpts=PTS-STARTPTS" -vsync vfr -q:v 2 -frames:v 1 -y "docs/img/${item.index}.jpg"`);
        await execAsync(`ffmpeg -i "${item.url}" -vf "select='eq(pict_type,I)',setpts=PTS-STARTPTS" -vsync vfr -q:v 2 -frames:v 1 -y "docs/img/${item.index}.jpg"`);
        await execAsync(`ffmpeg -i "docs/img/${item.index}.jpg" -vf "scale=iw*0.2:ih*0.2" -y "docs/img/${item.index}_thumbnail.jpg"`);
    }

}

main();