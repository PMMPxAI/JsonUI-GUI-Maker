// ==========================================================
// templates.js — premade ultra-stylish UI templates
// Each template returns the internal tree (root with children)
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  function el(name, type, props, children) {
    return {
      id: SW.uid(type),
      name,
      type,
      props: Object.assign({ type }, props || {}),
      children: children || []
    };
  }
  function root(children, namespace) {
    return {
      id: 'root', name: 'root', type: 'root', props: {},
      namespace: namespace || 'custom_ui',
      children: children || []
    };
  }

  // ---------- TEMPLATES ----------
  SW.TEMPLATES = [

    // 1) Empty
    {
      id: 'empty',
      name: 'Vide',
      tag: 'starter',
      desc: 'Toile vierge pour commencer de zéro',
      thumb: tpl_empty,
      build: () => root([])
    },

    // 2) Eclipse Sidebar HUD
    {
      id: 'neon_sidebar',
      name: 'Eclipse Sidebar',
      tag: 'hud',
      desc: 'Sidebar Eclipse avec accent orange',
      thumb: tpl_neon_sidebar,
      build: () => root([
        el('eclipse_sidebar', 'panel', {
          size: [132, 190], offset: [-8, 0],
          anchor_from: 'right_middle', anchor_to: 'right_middle'
        }, [
          el('bg', 'image', {
            size: ['100%', '100%'],
            texture: 'textures/ui/Black',
            color: [0.05, 0.05, 0.05, 0.9],
            anchor_from: 'center', anchor_to: 'center'
          }),
          el('accent_left', 'image', {
            size: [2, '100%'], offset: [0, 0],
            texture: 'textures/ui/White',
            color: [1, 0.42, 0.1, 1],
            anchor_from: 'left_middle', anchor_to: 'left_middle'
          }),
          el('title', 'label', {
            text: '§6▌ ECLIPSE§r', size: ['default', 14], offset: [0, 10],
            color: [1, 0.42, 0.1, 1],
            anchor_from: 'top_middle', anchor_to: 'top_middle',
            text_alignment: 'center', font_size: 'medium', shadow: true
          }),
          el('sep', 'image', {
            size: [80, 1], offset: [0, 28],
            texture: 'textures/ui/White',
            color: [0.15, 0.15, 0.15, 1],
            anchor_from: 'top_middle', anchor_to: 'top_middle'
          }),
          el('rank', 'label', {
            text: '§7Rank §f%rank%', size: ['default', 10], offset: [0, 38],
            anchor_from: 'top_middle', anchor_to: 'top_middle',
            text_alignment: 'center'
          }),
          el('coins', 'label', {
            text: '§6◆ §f%coins%', size: ['default', 10], offset: [0, 54],
            anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center'
          }),
          el('kills', 'label', {
            text: '§c⚔ §f%kills%', size: ['default', 10], offset: [0, 68],
            anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center'
          }),
          el('streak', 'label', {
            text: '§e⚡ §f%streak%', size: ['default', 10], offset: [0, 82],
            anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center'
          }),
          el('footer', 'label', {
            text: '§8play.eclipse.gg', size: ['default', 9], offset: [0, -8],
            anchor_from: 'bottom_middle', anchor_to: 'bottom_middle',
            text_alignment: 'center'
          })
        ])
      ])
    },

    // 3) Glassmorphism Button
    {
      id: 'glass_button',
      name: 'Glass Button',
      tag: 'button',
      desc: 'Bouton glassmorphism avec hover',
      thumb: tpl_glass_button,
      build: () => root([
        el('glass_btn', 'button', {
          size: [180, 44], anchor_from: 'center', anchor_to: 'center',
          $pressed_button_name: 'button.menu_play'
        }, [
          el('bg', 'image', {
            size: ['100%', '100%'],
            texture: 'textures/ui/White',
            color: [1, 1, 1, 0.08],
            anchor_from: 'center', anchor_to: 'center'
          }),
          el('border_top', 'image', {
            size: ['100%', 1],
            texture: 'textures/ui/White',
            color: [1, 1, 1, 0.35],
            anchor_from: 'top_middle', anchor_to: 'top_middle'
          }),
          el('lbl', 'label', {
            text: '§l▶ JOUER', size: ['default', 14],
            anchor_from: 'center', anchor_to: 'center',
            text_alignment: 'center', shadow: true
          })
        ])
      ])
    },

    // 4) Stats card
    {
      id: 'stats_card',
      name: 'Stats Card',
      tag: 'hud',
      desc: 'Carte de statistiques avec icônes',
      thumb: tpl_stats_card,
      build: () => root([
        el('stats', 'panel', {
          size: [220, 120], anchor_from: 'top_left', anchor_to: 'top_left', offset: [12, 12]
        }, [
          el('bg', 'image', {
            size: ['100%', '100%'], texture: 'textures/ui/White',
            color: [0.06, 0.08, 0.16, 0.8], anchor_from: 'center', anchor_to: 'center'
          }),
          el('header', 'image', {
            size: ['100%', 26], texture: 'textures/ui/White',
            color: [0.65, 0.33, 0.97, 0.6],
            anchor_from: 'top_left', anchor_to: 'top_left'
          }),
          el('title', 'label', {
            text: '§l✦ MES STATS', size: ['default', 12], offset: [10, 0],
            anchor_from: 'left_middle', anchor_to: 'left_middle',
            text_alignment: 'left', color: [1, 1, 1, 1]
          }),
          el('row1', 'label', {
            text: '§7Wins:        §f%wins%', size: ['default', 11], offset: [10, 36],
            anchor_from: 'top_left', anchor_to: 'top_left'
          }),
          el('row2', 'label', {
            text: '§7Kills:       §f%kills%', size: ['default', 11], offset: [10, 52],
            anchor_from: 'top_left', anchor_to: 'top_left'
          }),
          el('row3', 'label', {
            text: '§7K/D:         §f%kd%', size: ['default', 11], offset: [10, 68],
            anchor_from: 'top_left', anchor_to: 'top_left'
          }),
          el('row4', 'label', {
            text: '§7Win Streak:  §f%streak%', size: ['default', 11], offset: [10, 84],
            anchor_from: 'top_left', anchor_to: 'top_left'
          })
        ])
      ])
    },

    // 5) Server selector
    {
      id: 'server_list',
      name: 'Server List',
      tag: 'menu',
      desc: 'Liste de serveurs avec gradient',
      thumb: tpl_server_list,
      build: () => root([
        el('server_panel', 'stack_panel', {
          orientation: 'vertical', size: [240, '100%c'],
          anchor_from: 'center', anchor_to: 'center'
        }, [
          el('hdr', 'label', {
            text: '§b§l✦ SERVEURS', size: ['default', 18],
            text_alignment: 'center'
          }),
          el('s1', 'button', { size: [240, 36] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0, 0.88, 1, 0.18], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§b●§r BedWars §7· §f1234 joueurs', size: ['default', 12], anchor_from: 'left_middle', anchor_to: 'left_middle', offset: [12, 0] })
          ]),
          el('s2', 'button', { size: [240, 36] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.66, 0.33, 0.97, 0.18], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§d●§r SkyWars §7· §f876 joueurs', size: ['default', 12], anchor_from: 'left_middle', anchor_to: 'left_middle', offset: [12, 0] })
          ]),
          el('s3', 'button', { size: [240, 36] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [1, 0.24, 0.66, 0.18], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§c●§r Practice §7· §f432 joueurs', size: ['default', 12], anchor_from: 'left_middle', anchor_to: 'left_middle', offset: [12, 0] })
          ])
        ])
      ])
    },

    // 6) Hotbar overlay
    {
      id: 'hotbar_overlay',
      name: 'Hotbar Glow',
      tag: 'hud',
      desc: 'Overlay hotbar avec halo cyan',
      thumb: tpl_hotbar,
      build: () => root([
        el('hotbar_glow', 'panel', {
          size: [200, 30], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', offset: [0, -32]
        }, [
          el('halo', 'image', {
            size: ['100%', '100%'], texture: 'textures/ui/White',
            color: [0, 0.88, 1, 0.15], anchor_from: 'center', anchor_to: 'center'
          }),
          el('label', 'label', {
            text: '§b§l✦ §fSurfWind §b✦', size: ['default', 12],
            anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true
          })
        ])
      ])
    },

    // 7) Title screen logo
    {
      id: 'title_logo',
      name: 'Title Logo',
      tag: 'menu',
      desc: 'Logo géant avec sous-titre',
      thumb: tpl_logo,
      build: () => root([
        el('logo_block', 'panel', {
          size: [320, 100], anchor_from: 'center', anchor_to: 'center', offset: [0, -40]
        }, [
          el('big', 'label', {
            text: '§l§b S§dU§bR§dF§bW§dI§bN§dD ', size: ['default', 36],
            anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true
          }),
          el('sub', 'label', {
            text: '§7▰ The ultimate cracked bedrock network ▰', size: ['default', 12],
            anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center'
          })
        ])
      ])
    },

    // 8) Toast notification
    {
      id: 'toast_notif',
      name: 'Toast Notif',
      tag: 'hud',
      desc: 'Bulle de notification stylée',
      thumb: tpl_toast,
      build: () => root([
        el('toast', 'panel', {
          size: [220, 44], anchor_from: 'top_right', anchor_to: 'top_right', offset: [-12, 12]
        }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.06, 0.08, 0.16, 0.92], anchor_from: 'center', anchor_to: 'center' }),
          el('left', 'image', { size: [3, '100%'], texture: 'textures/ui/White', color: [0.66, 1, 0.23, 1], anchor_from: 'left_middle', anchor_to: 'left_middle' }),
          el('icon', 'label', { text: '§a✓', size: [20, '100%'], offset: [10, 0], anchor_from: 'left_middle', anchor_to: 'left_middle', text_alignment: 'center' }),
          el('title', 'label', { text: '§lAchievement Unlocked', size: ['default', 11], offset: [34, 8], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('msg', 'label', { text: '§7First Blood — +50 coins', size: ['default', 10], offset: [34, -8], anchor_from: 'bottom_left', anchor_to: 'bottom_left' })
        ])
      ])
    }
  ];

  // ---------- THUMBNAIL HTML (small CSS replicas of templates) ----------
  function tpl_empty() { return `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5a5a5a;font-size:11px;font-family:'Space Grotesk'">vide</div>`; }
  function tpl_neon_sidebar() {
    return `<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:60px;height:86px;background:#0d0d0d;border-left:2px solid #ff6b1a;border-radius:2px;padding:6px;font-family:'Space Grotesk';box-shadow:0 0 12px rgba(255,107,26,0.3)">
      <div style="color:#ff6b1a;text-align:center;font-size:8px;font-weight:700">▌ECLIPSE</div>
      <div style="color:#8a8a8a;text-align:center;font-size:6px;margin-top:3px">Rank VIP</div>
      <div style="color:#fff;text-align:center;font-size:6px;margin-top:6px">◆ 14.2k</div>
      <div style="color:#fff;text-align:center;font-size:6px">⚔ 893</div>
    </div>`;
  }
  function tpl_glass_button() {
    return `<div style="display:flex;align-items:center;justify-content:center;height:100%">
      <div style="padding:8px 18px;border-radius:5px;background:#ff6b1a;font:700 10px 'Space Grotesk';color:#fff;box-shadow:0 4px 14px rgba(255,107,26,0.4)">▶ JOUER</div>
    </div>`;
  }
  function tpl_stats_card() {
    return `<div style="position:absolute;top:10px;left:10px;width:120px;background:#1a1a1a;border:1px solid #262626;border-radius:4px;overflow:hidden;font-family:'Space Grotesk'">
      <div style="padding:4px 8px;background:#ff6b1a;font:700 7px;color:#fff;letter-spacing:0.1em;text-transform:uppercase">✦ STATS</div>
      <div style="padding:5px 8px;font-size:7px;line-height:1.6;color:#8a8a8a">
        <div>Wins: <span style="color:#fff;font-weight:600">128</span></div>
        <div>Kills: <span style="color:#fff;font-weight:600">1.4k</span></div>
        <div>K/D: <span style="color:#ff6b1a;font-weight:700">2.34</span></div>
      </div>
    </div>`;
  }
  function tpl_server_list() {
    return `<div style="display:flex;flex-direction:column;gap:3px;align-items:center;padding-top:14px;font-family:'Space Grotesk'">
      <div style="font:700 9px;color:#ff6b1a;letter-spacing:0.15em">✦ SERVEURS</div>
      <div style="width:130px;padding:4px 8px;background:#1a1a1a;border:1px solid #ff6b1a;border-radius:3px;font:600 7px;color:#fff">● BedWars · 1234</div>
      <div style="width:130px;padding:4px 8px;background:#1a1a1a;border:1px solid #262626;border-radius:3px;font:600 7px;color:#8a8a8a">● SkyWars · 876</div>
      <div style="width:130px;padding:4px 8px;background:#1a1a1a;border:1px solid #262626;border-radius:3px;font:600 7px;color:#8a8a8a">● Practice · 432</div>
    </div>`;
  }
  function tpl_hotbar() {
    return `<div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);padding:5px 12px;background:#1a1a1a;border:1px solid #ff6b1a;border-radius:3px;font:700 9px 'Space Grotesk';color:#fff;box-shadow:0 0 14px rgba(255,107,26,0.3)">✦ Eclipse ✦</div>`;
  }
  function tpl_logo() {
    return `<div style="display:flex;align-items:center;justify-content:center;flex-direction:column;height:100%;font-family:'Space Grotesk'">
      <div style="font:900 22px;color:#ff6b1a;letter-spacing:3px;text-shadow:0 2px 12px rgba(255,107,26,0.5)">ECLIPSE</div>
      <div style="font:500 7px;color:#8a8a8a;margin-top:4px;letter-spacing:0.2em;text-transform:uppercase">Bedrock network</div>
    </div>`;
  }
  function tpl_toast() {
    return `<div style="position:absolute;top:10px;right:10px;width:130px;padding:6px 8px;background:#1a1a1a;border:1px solid #262626;border-left:3px solid #22c55e;border-radius:4px;font-family:'Space Grotesk'">
      <div style="display:flex;align-items:center;gap:6px">
        <div style="color:#22c55e;font-size:10px;font-weight:700">✓</div>
        <div style="font-size:7px;line-height:1.3">
          <div style="font-weight:700;color:#fff">Achievement</div>
          <div style="color:#8a8a8a">+50 coins</div>
        </div>
      </div>
    </div>`;
  }

})(window.SW);
