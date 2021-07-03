const client = require("./index")
const ServerInfos = []
const ytdl = require("ytdl-core");
const Discord = require('discord.js');
const ytpl = require("ytpl")
const config = require("./config.json")
var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(config.ytapikey);

class ServerInfo {
    ID
    Channel
    PlayList
    VoiceConnection
    Loop
    CurrentSong
    Dispatcher
    Stop
    constructor(ServerID) {
        this.ID = ServerID;
        this.Channel = null;
        this.PlayList = [];
        this.Loop = false;
        this.Stop = 0;
        this.CurrentSong = null
        this.Dispatcher = null
        ServerInfos.push(this)
    }
    join(GuildID,AuthorID,channel){
        this.Channel = channel;
        let conditions = this.conditions(channel,AuthorID)
        return new Promise(function (resolve, reject){
            if(conditions==1){
                resolve("You need to be in a voice channel")
            } else if(conditions==2){
                resolve("I don't have permission to speak or to connect to your voice channel")
            }else {
                client.guilds.resolve(GuildID).members.resolve(AuthorID).voice.channel.join().then((connection)=>{
                    resolve(connection)
                });
            }
        })


    }
    async getSong(args){
        return new Promise(function (resolve, reject){
            console.log(args[0])
            if(args[0]==undefined){
                resolve("You need to specify a music to play")
            } else if(args[0].includes("playlist?list=")){
                getYTPlaylist(getYTPlaylistID(args[0])).then((res)=>{
                    resolve(res)
                })
            } else if(args[0].includes("watch?v=")){
                console.log("SINGLE VIDEO")
                getMusic(getYTVideoID(args[0])).then((res)=>{
                    resolve(res)
                })
            } else {
                getYoutubeSearch(args).then((res)=>{
                    resolve(res)
                })
            }
        })
    }
    player(){
        const embed = new Discord.MessageEmbed();
        embed.setColor('#ff0000');
        embed.setTitle("Now playing : \n"+this.CurrentSong.MusicTitle);
        embed.setURL(this.CurrentSong.MusicUrl);
        embed.setImage(this.CurrentSong.MusicThumbnail);
        this.Channel.send(embed);
        this.Dispatcher = this.VoiceConnection.play(ytdl(this.CurrentSong.MusicUrl,{filter:"audioonly",highWaterMark:1024*128,quality:"140"})).on("finish",()=>{
            if (this.Loop){
                this.PlayList.push(this.PlayList[0]);
            }
            this.PlayList.shift();
            if(this.PlayList.length>0){
                this.CurrentSong = this.PlayList[0]
                this.player();
            } else {
                this.Channel.send("Playlist is now empty")
                this.CurrentSong = null;
            }
        });
    }
    /*
    * 0 -> OK
    * 1 -> Author not connected
    * 2 -> Authorization issue
    */
    conditions(channel,authorID){
        console.log(client.guilds.resolve(channel.guild.id).members.resolve(authorID).voice.channel)
        if(client.guilds.resolve(channel.guild.id).members.resolve(authorID).voice.channel == null){
            return 1
        } else if(!client.guilds.resolve(channel.guild.id).members.resolve(authorID).voice.channel.permissionsFor(client.user).has("CONNECT")
            ||!client.guilds.resolve(channel.guild.id).members.resolve(authorID).voice.channel.permissionsFor(client.user).has("SPEAK")){
            return 2
        }
        return 0
    }
}

function getYoutubeSearch(args){
    return new Promise(function(resolve, reject) {
        youTube.search (args.join(), 1, {type:"video"}, async function(error, result) {
            if (error) {
                console.log(error);
                if(error.code==403){
                    resolve("Sorry request quota exceeded :(, You will have to wait until tomorrow for the quota to reset");
                } else {
                    resolve("Sorry their an unexpected error has occurred when searching on Youtube :(");
                }
            }else if (result.pageInfo.totalResults == 0){
                resolve("Sorry their is no match on youtube for your request :(");
            } else {
                let MusicUrl="https://www.youtube.com/watch?v="+ result.items[0].id.videoId;
                let MusicTitle=JSON.stringify(result.items[0].snippet.title).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&");
                MusicTitle = removeByIndex(removeByIndex(MusicTitle,MusicTitle.length-1),0);
                let MusicThumbnail=((await ytdl.getBasicInfo(MusicUrl)).videoDetails.thumbnails[3].url);
                let Music={MusicUrl,MusicTitle,MusicThumbnail};
                resolve(Music);
            };
        })});
};
function removeByIndex(str,index) {
    return str.slice(0,index) + str.slice(index+1);
}
function getYTPlaylistID(url){
    for(let i=0;i<url.length;i++){
        if(url.substr(i,14)=="playlist?list="){
            return url.substr(i+14,34)
        }
    }
}
function getYTVideoID(url){
    for(let i=0;i<url.length;i++){
        if(url.substr(i,8)=="watch?v="){
            return url.substr(i+8,11)
        }
    }
}

function getYTPlaylist(ID){
    return new Promise(async function(resolve){
        ytpl(ID,{limit:Infinity}).then(playlist=>{
            let Playlist=[]
            console.log(playlist.items[0])
            for(i=0;i<playlist.items.length;i++){
                let MusicUrl=playlist.items[i].shortUrl
                let MusicTitle=playlist.items[i].title.replace("|","")
                let MusicThumbnail=playlist.items[i].bestThumbnail.url
                let Music={MusicUrl,MusicTitle,MusicThumbnail}
                Playlist.push(Music)
                /*if(i==99){
                    break
                }*/
            }
            resolve({Playlist:Playlist,Title:playlist.title})
        })
    })
}
function getMusic(ID){
    return new Promise (async function(resolve){
        let MusicUrl="https://www.youtube.com/watch?v="+ID
        ytdl.getBasicInfo(MusicUrl)
            .then((infos)=>{
                let MusicTitle= infos.videoDetails.title
                let MusicThumbnail=infos.videoDetails.thumbnails[3].url
                let Music={MusicUrl,MusicTitle,MusicThumbnail}
                resolve(Music)
            }
        )
            .catch(()=>{
                resolve("Sorry I can't find this video :(")
            })
    })
}
module.exports = {ServerInfos,ServerInfo};