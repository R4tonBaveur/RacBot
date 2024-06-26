module.exports.run = (interaction) => {
    return new Promise(function (resolve, reject){
        const message = 
            ":musical_note: **MUSIC:**\n" +
            "   play <key-words> --- plays the music or playlist you searched for/adds it to the queue\n" +
            "   pause & resume --- pauses/resumes the current music in the queue\n" +
            "   skip --- skips the current music in the playlist \n" +
            "   destroy --- destroys the current music queue\n" +
            "   loop --- loops the current music queue or not\n" +
            "   remove <number> --- removes the specified music depending on it's place in the queue'\n" +
            "   queue --- displays the current music queue informations\n" +
            "   shuffle --- shuffles the current music queue\n" +
            "   download  <key-words> --- downloads the music and sends it to the channel\n" +
            ":question: **OTHER:**\n" +
            "   help --- gives you the different commands syntax\n" +
            "   ping --- pings the bot\n"
        resolve(message)
    })
};

module.exports.help = {
    name: 'help',
    description:'gives detailed information about commands usage',
    options:[]
};