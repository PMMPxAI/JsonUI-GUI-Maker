// ==========================================================
// templates.ts — premade ultra-stylish UI templates
// Each template returns the internal tree (root with children)
// ==========================================================
import type { UINode, UIProps, Template, ComponentType } from './types.ts';

const SW = window.SW;

function el(name: string, type: string, props?: Record<string, unknown>, children?: UINode[]): UINode {
  return {
    id: SW.uid(type),
    name,
    type,
    props: Object.assign({ type }, props || {}) as UIProps,
    children: children || []
  };
}
function root(children?: UINode[], namespace?: string): UINode {
  return {
    id: 'root', name: 'root', type: 'root', props: {} as UIProps,
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
  },
  // ==========================================
  // 9) Shop Grid — Item shop with price tags
  // ==========================================
  {
    id: 'shop_grid',
    name: 'Shop Grid',
    tag: 'menu',
    desc: 'Boutique avec grille d\'items et prix',
    thumb: tpl_shop_grid,
    build: () => root([
      el('shop_panel', 'panel', {
        size: [400, 300], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.05, 0.05, 0.05, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.65, 0.1, 0.8], anchor_from: 'center', anchor_to: 'center' }),
        el('inner_bg', 'image', { size: ['98%', '96%'], texture: 'textures/ui/Black', color: [0.05, 0.05, 0.05, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('title_bar', 'panel', { size: ['100%', 32], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('title_bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('title', 'label', { text: '§l§6SHOP', size: ['default', 14], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true }),
          el('close_btn', 'button', { size: [20, 20], anchor_from: 'right_middle', anchor_to: 'right_middle', offset: [-8, 0] }, [
            el('x', 'label', { text: '§fX', size: ['default', 12], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
          ])
        ]),
        el('subtitle', 'label', { text: '§7Sélectionnez un item à acheter', size: ['default', 10], offset: [0, 36], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
        el('items_grid', 'stack_panel', { orientation: 'vertical', size: ['90%', '100%c'], offset: [0, 52], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('row1', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 60] }, [
            el('item1', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/stone', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fStone x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$128', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ]),
            el('item2', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/iron_block', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fIron x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$256', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ]),
            el('item3', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/diamond_block', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fDiamond x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$512', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ]),
            el('item4', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/gold_block', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fGold x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$384', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ])
          ]),
          el('row2', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 60] }, [
            el('item5', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/emerald_block', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fEmerald x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$640', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ]),
            el('item6', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/redstone_block', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fRedstone x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$192', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ]),
            el('item7', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/lapis_block', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fLapis x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$160', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ]),
            el('item8', 'panel', { size: [80, 56] }, [
              el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
              el('icon', 'image', { size: [32, 32], texture: 'textures/blocks/obsidian', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 2] }),
              el('name', 'label', { text: '§fObsidian x64', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
              el('price', 'label', { text: '§a$480', size: ['default', 8], offset: [0, -2], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
            ])
          ])
        ])
      ])
    ])
  },

  // ==========================================
  // 10) Leaderboard — Top FFA rankings
  // ==========================================
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    tag: 'menu',
    desc: 'Classement des meilleurs joueurs',
    thumb: tpl_leaderboard,
    build: () => root([
      el('lb_panel', 'panel', {
        size: [380, 340], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.08, 0.08, 0.08, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.6, 0.1, 0.7], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['98%', '97%'], texture: 'textures/ui/Black', color: [0.06, 0.06, 0.06, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('title_bar', 'panel', { size: ['100%', 30], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('title_bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('title', 'label', { text: '§l§6TOP FFA', size: ['default', 14], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true }),
          el('close', 'button', { size: [20, 20], anchor_from: 'right_middle', anchor_to: 'right_middle', offset: [-6, 0] }, [
            el('x', 'label', { text: '§fX', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ])
        ]),
        el('subtitle', 'label', { text: '§e§lBest Players Season 1', size: ['default', 10], offset: [0, 34], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
        el('podium', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 70], offset: [0, 52], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('p2', 'panel', { size: [100, 66] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('medal', 'image', { size: [28, 28], texture: 'textures/items/diamond', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 4] }),
            el('name', 'label', { text: '§f#2 Troll face', size: ['default', 8], offset: [0, -16], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
            el('stats', 'label', { text: '§7K:9 D:10 KDR: 5', size: ['default', 7], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ]),
          el('p1', 'panel', { size: [110, 66] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('medal', 'image', { size: [28, 28], texture: 'textures/items/emerald', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 4] }),
            el('name', 'label', { text: '§f#1 Skibidi Sigma', size: ['default', 8], offset: [0, -16], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
            el('stats', 'label', { text: '§7K:12 D:10 KDR: 1.2', size: ['default', 7], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ]),
          el('p3', 'panel', { size: [100, 66] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('medal', 'image', { size: [28, 28], texture: 'textures/items/gold_ingot', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 4] }),
            el('name', 'label', { text: '§f#3 Rasputin88', size: ['default', 8], offset: [0, -16], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' }),
            el('stats', 'label', { text: '§7K:3 D:15 KDR: 2', size: ['default', 7], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ])
        ]),
        el('list', 'stack_panel', { orientation: 'vertical', size: ['90%', '100%c'], offset: [0, 130], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('r4', 'panel', { size: ['100%', 24] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('txt', 'label', { text: '§7#4 test  §8K:1 D:1 KDR: 1.0', size: ['default', 8], offset: [8, 0], anchor_from: 'left_middle', anchor_to: 'left_middle' })
          ]),
          el('r5', 'panel', { size: ['100%', 24] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.08, 0.08, 0.08, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('txt', 'label', { text: '§7#5 test  §8K:1 D:1 KDR: 1.0', size: ['default', 8], offset: [8, 0], anchor_from: 'left_middle', anchor_to: 'left_middle' })
          ]),
          el('r6', 'panel', { size: ['100%', 24] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('txt', 'label', { text: '§7#6 test  §8K:1 D:1 KDR: 1.0', size: ['default', 8], offset: [8, 0], anchor_from: 'left_middle', anchor_to: 'left_middle' })
          ])
        ])
      ])
    ])
  },

  // ==========================================
  // 11) Party Menu
  // ==========================================
  {
    id: 'party_menu',
    name: 'Party Menu',
    tag: 'menu',
    desc: 'Menu de groupe avec créer/invitations',
    thumb: tpl_party_menu,
    build: () => root([
      el('party_panel', 'panel', {
        size: [360, 260], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.12, 0.12, 0.12, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.55, 0.1, 0.7], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['97%', '95%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§l§6PARTY MENU', size: ['default', 14], offset: [0, 10], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
        el('subtitle', 'label', { text: '§7Select one option', size: ['default', 10], offset: [0, 28], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
        el('options', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 120], anchor_from: 'center', anchor_to: 'center', offset: [0, 10] }, [
          el('create', 'button', { size: [140, 116] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [48, 48], texture: 'textures/items/gold_helmet', anchor_from: 'center', anchor_to: 'center', offset: [0, -10] }),
            el('lbl', 'label', { text: '§fCreate Party', size: ['default', 10], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ]),
          el('invites', 'button', { size: [140, 116] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [48, 48], texture: 'textures/items/paper', anchor_from: 'center', anchor_to: 'center', offset: [0, -10] }),
            el('lbl', 'label', { text: '§fInvites', size: ['default', 10], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ])
        ]),
        el('close_btn', 'button', { size: ['80%', 28], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.6, 0.15, 0.15, 0.8], anchor_from: 'center', anchor_to: 'center' }),
          el('lbl', 'label', { text: '§l§fCLOSE MENU', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
        ])
      ])
    ])
  },

  // ==========================================
  // 12) Color Picker
  // ==========================================
  {
    id: 'color_picker',
    name: 'Color Picker',
    tag: 'menu',
    desc: 'Sélecteur de couleur avec grille',
    thumb: tpl_color_picker,
    build: () => {
      const colors = [
        [0.85,0.85,0.85,1], [0.5,0.5,0.5,1], [0.3,0.3,0.3,1], [0.6,0.2,0.2,1],
        [0.2,0.6,0.2,1], [0.2,0.5,0.9,1], [0.8,0.2,0.4,1], [0.8,0.4,0.8,1],
        [0.9,0.4,0.6,1], [0.4,0.3,0.5,1], [0.3,0.6,0.3,1], [0.3,0.7,0.9,1]
      ];
      const colorEls = colors.map((c, i) =>
        el('c'+i, 'button', { size: [28, 28] }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: c, anchor_from: 'center', anchor_to: 'center' })
        ])
      );
      return root([
        el('picker_panel', 'panel', {
          size: [280, 220], anchor_from: 'center', anchor_to: 'center'
        }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.12, 0.1, 0.95], anchor_from: 'center', anchor_to: 'center' }),
          el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.7, 0.5, 0.2, 0.8], anchor_from: 'center', anchor_to: 'center' }),
          el('inner', 'image', { size: ['96%', '93%'], texture: 'textures/ui/Black', color: [0.12, 0.1, 0.08, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('title', 'label', { text: '§l§6COLOR PICKER', size: ['default', 12], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
          el('subtitle', 'label', { text: '§eSELECT A CHAT-RANK BACKGROUND COLOR!', size: ['default', 8], offset: [0, 24], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
          el('grid_wrap', 'panel', { size: [130, 130], offset: [-40, 44], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
            el('grid', 'grid', { size: ['100%', '100%'], grid_dimensions: [4, 3], anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('preview_panel', 'panel', { size: [80, 60], offset: [80, 60], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
            el('preview_bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl1', 'label', { text: '§fSELECTED COLOR', size: ['default', 7], offset: [0, 6], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
            el('color_swatch', 'image', { size: [30, 20], texture: 'textures/ui/White', color: [0.5, 0.5, 0.5, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl2', 'label', { text: '§7> GRAY', size: ['default', 7], offset: [0, -6], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ]),
          el('submit_btn', 'button', { size: [60, 20], offset: [0, -10], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.8, 0.2, 0.2, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§l§fSUBMIT', size: ['default', 8], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
          ])
        ])
      ]);
    }
  },

  // ==========================================
  // 13) Skill Tree
  // ==========================================
  {
    id: 'skill_tree',
    name: 'Skill Tree',
    tag: 'hud',
    desc: 'Arbre de compétences avec connexions',
    thumb: tpl_skill_tree,
    build: () => root([
      el('tree_panel', 'panel', {
        size: [500, 320], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.05, 0.12, 0.12, 0.85], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0, 0.9, 0.8, 0.6], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['98%', '97%'], texture: 'textures/ui/White', color: [0.03, 0.08, 0.08, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§l§bSKILLTREE', size: ['default', 16], offset: [0, 12], anchor_from: 'top_left', anchor_to: 'top_left', color: [0, 0.9, 0.8, 1], shadow: true }),
        el('line_h', 'image', { size: [120, 2], texture: 'textures/ui/White', color: [0, 0.9, 0.8, 0.6], anchor_from: 'center', anchor_to: 'center', offset: [-60, 0] }),
        el('line_v', 'image', { size: [2, 120], texture: 'textures/ui/White', color: [0.5, 0.5, 0.5, 0.4], anchor_from: 'center', anchor_to: 'center' }),
        el('node_center', 'panel', { size: [52, 52], anchor_from: 'center', anchor_to: 'center' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0, 0.9, 0.8, 0.3], anchor_from: 'center', anchor_to: 'center' }),
          el('icon', 'image', { size: [32, 32], texture: 'textures/entity/enderman/enderman', anchor_from: 'center', anchor_to: 'center' })
        ]),
        el('node_left', 'panel', { size: [44, 44], anchor_from: 'center', anchor_to: 'center', offset: [-100, 0] }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0, 0.9, 0.8, 0.3], anchor_from: 'center', anchor_to: 'center' }),
          el('icon', 'image', { size: [28, 28], texture: 'textures/blocks/fire_0', anchor_from: 'center', anchor_to: 'center' })
        ]),
        el('node_right', 'panel', { size: [44, 44], anchor_from: 'center', anchor_to: 'center', offset: [100, 0] }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.5, 0.5, 0.5, 0.2], anchor_from: 'center', anchor_to: 'center' }),
          el('icon', 'image', { size: [28, 28], texture: 'textures/items/iron_pickaxe', anchor_from: 'center', anchor_to: 'center' })
        ]),
        el('node_top', 'panel', { size: [44, 44], anchor_from: 'center', anchor_to: 'center', offset: [0, -70] }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.5, 0.5, 0.5, 0.2], anchor_from: 'center', anchor_to: 'center' }),
          el('icon', 'image', { size: [28, 28], texture: 'textures/items/bow_standby', anchor_from: 'center', anchor_to: 'center' })
        ]),
        el('node_bottom', 'panel', { size: [44, 44], anchor_from: 'center', anchor_to: 'center', offset: [0, 70] }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.5, 0.5, 0.5, 0.2], anchor_from: 'center', anchor_to: 'center' }),
          el('icon', 'image', { size: [28, 28], texture: 'textures/items/chorus_fruit', anchor_from: 'center', anchor_to: 'center' })
        ])
      ])
    ])
  },

  // ==========================================
  // 14) Casino Menu — Minesweeper style
  // ==========================================
  {
    id: 'casino_menu',
    name: 'Casino Menu',
    tag: 'menu',
    desc: 'Menu casino style minesweeper',
    thumb: tpl_casino_menu,
    build: () => root([
      el('casino_panel', 'panel', {
        size: [340, 320], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.06, 0.06, 0.06, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('title_bar', 'panel', { size: ['100%', 34], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.15, 0.1, 0.2, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('title', 'label', { text: '§l§eCASINO MENU', size: ['default', 14], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true }),
          el('close', 'button', { size: [22, 22], anchor_from: 'right_middle', anchor_to: 'right_middle', offset: [-6, 0] }, [
            el('x', 'label', { text: '§fX', size: ['default', 12], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ])
        ]),
        el('mine_grid', 'grid', { size: [200, 200], grid_dimensions: [5, 5], offset: [-40, 44], anchor_from: 'top_middle', anchor_to: 'top_middle' }),
        el('info_panel', 'panel', { size: [100, 100], offset: [110, 80], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.2, 0.1, 0.35, 0.8], anchor_from: 'center', anchor_to: 'center' }),
          el('win', 'label', { text: '§fWin: §a$1,800', size: ['default', 9], offset: [6, 6], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('mult', 'label', { text: '§fMultiplier: §e1.8x', size: ['default', 9], offset: [6, 20], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('score', 'label', { text: '§fScore: §b1/21', size: ['default', 9], offset: [6, 34], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('cashout_hint', 'label', { text: '§a§l>> Can cashout <<', size: ['default', 8], offset: [0, -10], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
        ]),
        el('cashout_btn', 'button', { size: [120, 30], offset: [-40, -16], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('lbl', 'label', { text: '§l§fCASH OUT!', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
        ])
      ])
    ])
  },

  // ==========================================
  // 15) Spin Wheel — Roulette
  // ==========================================
  {
    id: 'spin_wheel',
    name: 'Spin Wheel',
    tag: 'menu',
    desc: 'Roulette avec items aléatoires',
    thumb: tpl_spin_wheel,
    build: () => root([
      el('spin_panel', 'panel', {
        size: [400, 200], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.08, 0.08, 0.08, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§l§eSPIN WHEEL', size: ['default', 16], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
        el('arrow', 'label', { text: '§e▼', size: ['default', 18], offset: [0, 28], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
        el('reel', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 64], anchor_from: 'center', anchor_to: 'center' }, [
          el('slot1', 'panel', { size: [64, 64] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [40, 40], texture: 'textures/items/bone', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('slot2', 'panel', { size: [64, 64] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [40, 40], texture: 'textures/items/iron_sword', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('slot3', 'panel', { size: [64, 64] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [40, 40], texture: 'textures/items/bread', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('slot4', 'panel', { size: [64, 64] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [40, 40], texture: 'textures/items/apple', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('slot5', 'panel', { size: [64, 64] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [40, 40], texture: 'textures/items/stick', anchor_from: 'center', anchor_to: 'center' })
          ])
        ]),
        el('spin_btn', 'button', { size: [140, 30], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.6, 0.1, 0.9], anchor_from: 'center', anchor_to: 'center' }),
          el('lbl', 'label', { text: '§l§fSPIN', size: ['default', 12], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
        ])
      ])
    ])
  },

  // ==========================================
  // 16) Cosmetics Menu
  // ==========================================
  {
    id: 'cosmetics_menu',
    name: 'Cosmetics',
    tag: 'menu',
    desc: 'Menu cosmétiques avec catégories',
    thumb: tpl_cosmetics_menu,
    build: () => root([
      el('cosm_panel', 'panel', {
        size: [440, 280], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.55, 0.1, 0.7], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['98%', '96%'], texture: 'textures/ui/Black', color: [0.08, 0.08, 0.08, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§l§6COSMETICS', size: ['default', 14], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
        el('close', 'button', { size: [20, 20], anchor_from: 'top_right', anchor_to: 'top_right', offset: [-8, 8] }, [
          el('x', 'label', { text: '§fX', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('preview_area', 'panel', { size: [120, 200], offset: [16, 36], anchor_from: 'top_left', anchor_to: 'top_left' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('skin', 'image', { size: [80, 160], texture: 'textures/entity/steve', anchor_from: 'center', anchor_to: 'center' })
        ]),
        el('tabs', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 22], offset: [150, 36], anchor_from: 'top_left', anchor_to: 'top_left' }, [
          el('prev', 'button', { size: [20, 20] }, [
            el('lbl', 'label', { text: '§f<', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('tabA', 'button', { size: [22, 20] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.55, 0.1, 0.8], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§lA', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
          ]),
          el('tabB', 'button', { size: [22, 20] }, [
            el('lbl', 'label', { text: '§fB', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('tabC', 'button', { size: [22, 20] }, [
            el('lbl', 'label', { text: '§fC', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('tabD', 'button', { size: [22, 20] }, [
            el('lbl', 'label', { text: '§fD', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('next', 'button', { size: [20, 20] }, [
            el('lbl', 'label', { text: '§f>', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ])
        ]),
        el('items', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 80], offset: [150, 66], anchor_from: 'top_left', anchor_to: 'top_left' }, [
          el('empty_slot', 'panel', { size: [60, 76] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [32, 32], texture: 'textures/ui/cancel', anchor_from: 'center', anchor_to: 'center', offset: [0, -8], color: [1, 0.2, 0.2, 1] }),
            el('lbl', 'label', { text: '§7empty', size: ['default', 8], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ]),
          el('item1', 'panel', { size: [60, 76] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [32, 32], texture: 'textures/items/diamond', anchor_from: 'center', anchor_to: 'center', offset: [0, -8] }),
            el('lbl', 'label', { text: '§ftest1', size: ['default', 8], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ]),
          el('item2', 'panel', { size: [60, 76] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [32, 32], texture: 'textures/items/leather_chestplate', anchor_from: 'center', anchor_to: 'center', offset: [0, -8] }),
            el('lbl', 'label', { text: '§ftest2', size: ['default', 8], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ]),
          el('item3', 'panel', { size: [60, 76] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [32, 32], texture: 'textures/items/paper', anchor_from: 'center', anchor_to: 'center', offset: [0, -8] }),
            el('lbl', 'label', { text: '§ftest3', size: ['default', 8], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
          ])
        ])
      ])
    ])
  },

  // ==========================================
  // 17) Equipment Selection
  // ==========================================
  {
    id: 'equipment_select',
    name: 'Equipment Select',
    tag: 'menu',
    desc: 'Sélection d\'équipement par catégorie',
    thumb: tpl_equipment_select,
    build: () => root([
      el('equip_panel', 'panel', {
        size: [420, 280], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.12, 0.12, 0.15, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.4, 0.4, 0.45, 0.5], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['98%', '96%'], texture: 'textures/ui/White', color: [0.1, 0.1, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§fSeleccion de equipamiento', size: ['default', 12], offset: [0, 10], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
        el('close', 'button', { size: [20, 20], anchor_from: 'top_right', anchor_to: 'top_right', offset: [-8, 8] }, [
          el('x', 'label', { text: '§fX', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('categories', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 110], anchor_from: 'center', anchor_to: 'center', offset: [0, -10] }, [
          el('rifles', 'button', { size: [120, 106] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.18, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [64, 48], texture: 'textures/items/crossbow_standby', anchor_from: 'center', anchor_to: 'center', offset: [0, -10] }),
            el('lbl', 'label', { text: '§fRifles', size: ['default', 10], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ]),
          el('pistols', 'button', { size: [120, 106] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.18, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [64, 48], texture: 'textures/items/bow_standby', anchor_from: 'center', anchor_to: 'center', offset: [0, -10] }),
            el('lbl', 'label', { text: '§fPistolas', size: ['default', 10], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ]),
          el('knives', 'button', { size: [120, 106] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.18, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [64, 48], texture: 'textures/items/fishing_rod_uncast', anchor_from: 'center', anchor_to: 'center', offset: [0, -10] }),
            el('lbl', 'label', { text: '§fCuchillos', size: ['default', 10], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ])
        ]),
        el('random_btn', 'button', { size: ['60%', 50], offset: [0, -14], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.18, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('icon', 'image', { size: [28, 28], texture: 'textures/items/gold_helmet', anchor_from: 'center', anchor_to: 'center', offset: [0, -4] }),
          el('lbl', 'label', { text: '§e§lSET RANDOM', size: ['default', 10], offset: [0, -4], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
        ])
      ])
    ])
  },

  // ==========================================
  // 18) Daily Rewards — Chest opening
  // ==========================================
  {
    id: 'daily_rewards',
    name: 'Daily Rewards',
    tag: 'menu',
    desc: 'Coffres quotidien/hebdo/mensuel',
    thumb: tpl_daily_rewards,
    build: () => root([
      el('rewards_panel', 'panel', {
        size: [420, 200], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.25, 0.2, 0.35, 0.9], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.65, 0.1, 0.6], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['96%', '92%'], texture: 'textures/ui/White', color: [0.2, 0.15, 0.3, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('chests', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 140], anchor_from: 'center', anchor_to: 'center' }, [
          el('daily', 'panel', { size: [110, 136] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.85, 0.65, 0.1, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('inner', 'image', { size: ['92%', '90%'], texture: 'textures/ui/White', color: [0.75, 0.55, 0.05, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('label', 'label', { text: '§l§fDAILY', size: ['default', 10], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
            el('chest_icon', 'image', { size: [48, 48], texture: 'textures/blocks/chest_front', anchor_from: 'center', anchor_to: 'center' }),
            el('open_lbl', 'label', { text: '§l§fOPEN NOW', size: ['default', 9], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ]),
          el('monthly', 'panel', { size: [110, 136] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.85, 0.65, 0.1, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('inner', 'image', { size: ['92%', '90%'], texture: 'textures/ui/White', color: [0.75, 0.55, 0.05, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('label', 'label', { text: '§l§fMONTHLY', size: ['default', 10], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
            el('chest_icon', 'image', { size: [48, 48], texture: 'textures/blocks/ender_chest_front', anchor_from: 'center', anchor_to: 'center' }),
            el('open_lbl', 'label', { text: '§l§fOPEN NOW', size: ['default', 9], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ]),
          el('weekly', 'panel', { size: [110, 136] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.85, 0.65, 0.1, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('inner', 'image', { size: ['92%', '90%'], texture: 'textures/ui/White', color: [0.75, 0.55, 0.05, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('label', 'label', { text: '§l§fWEEKLY', size: ['default', 10], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
            el('chest_icon', 'image', { size: [48, 48], texture: 'textures/blocks/trapped_chest_front', anchor_from: 'center', anchor_to: 'center' }),
            el('open_lbl', 'label', { text: '§l§fOPEN NOW', size: ['default', 9], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center', shadow: true })
          ])
        ])
      ])
    ])
  },

  // ==========================================
  // 19) Market Shop — Buy/Sell items
  // ==========================================
  {
    id: 'market_shop',
    name: 'Market Shop',
    tag: 'menu',
    desc: 'Marché avec achat/vente et catégories',
    thumb: tpl_market_shop,
    build: () => root([
      el('market_panel', 'panel', {
        size: [480, 340], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.06, 0.06, 0.06, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§l§fMARKET SHOP', size: ['default', 16], offset: [0, 8], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
        el('player_info', 'panel', { size: [160, 16], offset: [-10, 10], anchor_from: 'top_right', anchor_to: 'top_right' }, [
          el('name', 'label', { text: '§fPlayer: §aEKats01', size: ['default', 8], offset: [0, 0], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('balance', 'label', { text: '§fBalance: §a$200.67K §7[MONEY]', size: ['default', 7], offset: [0, 10], anchor_from: 'top_left', anchor_to: 'top_left' })
        ]),
        el('categories_bar', 'stack_panel', { orientation: 'horizontal', size: ['100%c', 32], offset: [10, 30], anchor_from: 'top_left', anchor_to: 'top_left' }, [
          el('cat1', 'button', { size: [32, 30] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [20, 20], texture: 'textures/blocks/grass_side', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('cat2', 'button', { size: [32, 30] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [20, 20], texture: 'textures/blocks/stone', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('cat3', 'button', { size: [32, 30] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [20, 20], texture: 'textures/blocks/diamond_ore', anchor_from: 'center', anchor_to: 'center' })
          ]),
          el('cat4', 'button', { size: [32, 30] }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
            el('icon', 'image', { size: [20, 20], texture: 'textures/items/iron_pickaxe', anchor_from: 'center', anchor_to: 'center' })
          ])
        ]),
        el('item_grid', 'grid', { size: [280, 220], grid_dimensions: [8, 5], offset: [10, 68], anchor_from: 'top_left', anchor_to: 'top_left' }),
        el('detail_panel', 'panel', { size: [160, 220], offset: [-10, 68], anchor_from: 'top_right', anchor_to: 'top_right' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.12, 0.12, 0.12, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('item_preview', 'image', { size: [80, 80], texture: 'textures/blocks/log_oak', anchor_from: 'top_middle', anchor_to: 'top_middle', offset: [0, 10] }),
          el('item_name', 'label', { text: '§fOak Log', size: ['default', 10], offset: [0, 96], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
          el('price_info', 'label', { text: '§fx64  §a$3.84K  §7/  §a$768', size: ['default', 8], offset: [0, 112], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' }),
          el('buy_btn', 'button', { size: ['80%', 24], offset: [0, 134], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.1, 0.6, 0.1, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§l§fCOMPRAR', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
          ]),
          el('sell_btn', 'button', { size: ['80%', 24], offset: [0, 162], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.6, 0.1, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§l§fVENDER', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
          ]),
          el('exit_btn', 'button', { size: ['80%', 20], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
            el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.8, 0.15, 0.15, 0.9], anchor_from: 'center', anchor_to: 'center' }),
            el('lbl', 'label', { text: '§l§fEXIT', size: ['default', 8], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
          ])
        ])
      ])
    ])
  },

  // ==========================================
  // 20) Add Friend
  // ==========================================
  {
    id: 'friend_add',
    name: 'Add Friend',
    tag: 'menu',
    desc: 'Formulaire d\'ajout d\'ami',
    thumb: tpl_friend_add,
    build: () => root([
      el('friend_panel', 'panel', {
        size: [300, 220], anchor_from: 'center', anchor_to: 'center'
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.1, 0.1, 0.1, 0.95], anchor_from: 'center', anchor_to: 'center' }),
        el('border', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.9, 0.55, 0.1, 0.7], anchor_from: 'center', anchor_to: 'center' }),
        el('inner', 'image', { size: ['96%', '94%'], texture: 'textures/ui/Black', color: [0.08, 0.08, 0.08, 1], anchor_from: 'center', anchor_to: 'center' }),
        el('title', 'label', { text: '§l§6ADD FRIEND', size: ['default', 14], offset: [0, 10], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
        el('online_label', 'label', { text: '§7Online Players', size: ['default', 10], offset: [16, 36], anchor_from: 'top_left', anchor_to: 'top_left' }),
        el('dropdown_online', 'dropdown', { size: ['85%', 26], offset: [0, 52], anchor_from: 'top_middle', anchor_to: 'top_middle', dropdown_name: 'None' }),
        el('or_label', 'label', { text: '§7Or type a username', size: ['default', 10], offset: [16, 90], anchor_from: 'top_left', anchor_to: 'top_left' }),
        el('input_name', 'input_panel', { size: ['85%', 26], offset: [0, 106], anchor_from: 'top_middle', anchor_to: 'top_middle', placeholder_text: 'Player name' }),
        el('add_btn', 'button', { size: ['85%', 30], offset: [0, -16], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('lbl', 'label', { text: '§a§lAdd Friend', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
        ])
      ])
    ])
  },

  // ==========================================
  // 21) Scoreboard HUD
  // ==========================================
  {
    id: 'scoreboard_hud',
    name: 'Scoreboard',
    tag: 'hud',
    desc: 'Scoreboard HUD latéral',
    thumb: tpl_scoreboard,
    build: () => root([
      el('scoreboard', 'panel', {
        size: [140, 160], anchor_from: 'right_middle', anchor_to: 'right_middle', offset: [-6, -20]
      }, [
        el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/Black', color: [0.04, 0.04, 0.04, 0.75], anchor_from: 'center', anchor_to: 'center' }),
        el('header', 'panel', { size: ['100%', 18], anchor_from: 'top_middle', anchor_to: 'top_middle' }, [
          el('bg', 'image', { size: ['100%', '100%'], texture: 'textures/ui/White', color: [0.8, 0.3, 0, 0.9], anchor_from: 'center', anchor_to: 'center' }),
          el('title', 'label', { text: '§l§f%server_name%', size: ['default', 9], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true })
        ]),
        el('lines', 'stack_panel', { orientation: 'vertical', size: ['100%', '100%c'], offset: [0, 22], anchor_from: 'top_left', anchor_to: 'top_left' }, [
          el('l1', 'label', { text: '§7Online: §f%online%', size: ['default', 8], offset: [6, 0], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('l2', 'label', { text: '§7Map: §e%map%', size: ['default', 8], offset: [6, 0], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('sep', 'image', { size: ['80%', 1], texture: 'textures/ui/White', color: [0.3, 0.3, 0.3, 0.5], anchor_from: 'top_middle', anchor_to: 'top_middle' }),
          el('l3', 'label', { text: '§6Kills: §f%kills%', size: ['default', 8], offset: [6, 0], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('l4', 'label', { text: '§cDeaths: §f%deaths%', size: ['default', 8], offset: [6, 0], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('l5', 'label', { text: '§eCoins: §f%coins%', size: ['default', 8], offset: [6, 0], anchor_from: 'top_left', anchor_to: 'top_left' }),
          el('sep2', 'image', { size: ['80%', 1], texture: 'textures/ui/White', color: [0.3, 0.3, 0.3, 0.5], anchor_from: 'top_middle', anchor_to: 'top_middle' }),
          el('footer', 'label', { text: '§8play.server.gg', size: ['default', 7], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center' })
        ])
      ])
    ])
  }

  // ---- ANIMATED TEMPLATES ----
  ,{
    id: 'animated_roulette', name: 'Roulette Casino', tag: 'Animé', desc: 'Roue animée qui tourne — appuie sur Lecture pour voir le spin',
    thumb: () => tpl_roulette_thumb(),
    build: () => root([
      el('bg', 'panel', { size: ['100%', '100%'], color: [0.05, 0.05, 0.05, 1] }, [
        el('title', 'label', { text: '§l§6ROULETTE', size: ['default', 14], offset: [0, 12], anchor_from: 'top_middle', anchor_to: 'top_middle', text_alignment: 'center', shadow: true }),
        el('wheel_container', 'panel', { size: [160, 160], offset: [0, 10], anchor_from: 'center', anchor_to: 'center' }, [
          el('wheel_bg', 'image', { size: [160, 160], texture: 'textures/ui/White', color: [0.15, 0.15, 0.15, 1], anchor_from: 'center', anchor_to: 'center' }),
          el('slot1', 'panel', { size: [50, 22], offset: [0, -60], anchor_from: 'center', anchor_to: 'center', color: [0.8, 0.2, 0.2, 1] }, [
            el('s1_txt', 'label', { text: '§l2x', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('slot2', 'panel', { size: [50, 22], offset: [55, -20], anchor_from: 'center', anchor_to: 'center', color: [0.2, 0.7, 0.2, 1] }, [
            el('s2_txt', 'label', { text: '§l5x', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('slot3', 'panel', { size: [50, 22], offset: [55, 30], anchor_from: 'center', anchor_to: 'center', color: [0.9, 0.6, 0.1, 1] }, [
            el('s3_txt', 'label', { text: '§l10x', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('slot4', 'panel', { size: [50, 22], offset: [0, 60], anchor_from: 'center', anchor_to: 'center', color: [0.6, 0.2, 0.8, 1] }, [
            el('s4_txt', 'label', { text: '§l3x', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('slot5', 'panel', { size: [50, 22], offset: [-55, 30], anchor_from: 'center', anchor_to: 'center', color: [0.2, 0.5, 0.9, 1] }, [
            el('s5_txt', 'label', { text: '§l1x', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('slot6', 'panel', { size: [50, 22], offset: [-55, -20], anchor_from: 'center', anchor_to: 'center', color: [0.9, 0.3, 0.5, 1] }, [
            el('s6_txt', 'label', { text: '§l20x', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
          ]),
          el('center_dot', 'image', { size: [16, 16], texture: 'textures/ui/White', color: [1, 0.8, 0, 1], anchor_from: 'center', anchor_to: 'center' })
        ]),
        el('pointer', 'label', { text: '§l§e▼', size: ['default', 14], offset: [0, -76], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' }),
        el('spin_btn', 'button', { size: [100, 28], offset: [0, 100], anchor_from: 'center', anchor_to: 'center', color: [0.9, 0.4, 0, 1] }, [
          el('spin_txt', 'label', { text: '§l§fSPIN !', size: ['default', 12], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('balance', 'label', { text: '§7Solde: §e1,250 coins', size: ['default', 8], offset: [0, -12], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
      ]),
      el('anim_spin', 'panel', { anim_type: 'offset', duration: 2.0, from: [0, 0], to: [0, -200], easing: 'out_cubic' }),
      el('anim_fade', 'panel', { anim_type: 'alpha', duration: 0.5, from: 0, to: 1, easing: 'out_cubic' })
    ], 'roulette_ui')
  },
  {
    id: 'animated_welcome', name: 'Écran d\'accueil animé', tag: 'Animé', desc: 'Titre + boutons avec apparition progressive — appuie Lecture',
    thumb: () => tpl_welcome_thumb(),
    build: () => root([
      el('bg', 'panel', { size: ['100%', '100%'], color: [0.04, 0.04, 0.06, 1] }, [
        el('glow_top', 'image', { size: ['100%', '40%'], texture: 'textures/ui/White', color: [0.2, 0.1, 0.4, 0.15], anchor_from: 'top_middle', anchor_to: 'top_middle' }),
        el('logo', 'panel', { size: [200, 60], offset: [0, -40], anchor_from: 'center', anchor_to: 'center', alpha: '@welcome_ui.anim_logo_fade' }, [
          el('logo_txt', 'label', { text: '§l§5✦ REALM §fCRAFT', size: ['default', 20], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true }),
          el('subtitle', 'label', { text: '§7Saison 4 — Faction Wars', size: ['default', 8], offset: [0, 20], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('btn_play', 'button', { size: [160, 32], offset: [0, 30], anchor_from: 'center', anchor_to: 'center', color: [0.4, 0.1, 0.8, 1], alpha: '@welcome_ui.anim_btn1_fade' }, [
          el('play_txt', 'label', { text: '§l§fJOUER', size: ['default', 12], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('btn_shop', 'button', { size: [160, 32], offset: [0, 70], anchor_from: 'center', anchor_to: 'center', color: [0.15, 0.15, 0.2, 1], alpha: '@welcome_ui.anim_btn2_fade' }, [
          el('shop_txt', 'label', { text: '§e✦ §fBOUTIQUE', size: ['default', 12], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('btn_settings', 'button', { size: [160, 32], offset: [0, 110], anchor_from: 'center', anchor_to: 'center', color: [0.15, 0.15, 0.2, 1], alpha: '@welcome_ui.anim_btn3_fade' }, [
          el('settings_txt', 'label', { text: '§7⚙ PARAMÈTRES', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ]),
        el('footer', 'label', { text: '§8v4.2.1 · play.realmcraft.gg', size: ['default', 7], offset: [0, -8], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
      ]),
      el('anim_logo_fade', 'panel', { anim_type: 'alpha', duration: 0.8, from: 0, to: 1, easing: 'out_cubic' }),
      el('anim_btn1_fade', 'panel', { anim_type: 'alpha', duration: 0.4, from: 0, to: 1, easing: 'out_cubic' }),
      el('anim_btn2_fade', 'panel', { anim_type: 'alpha', duration: 0.4, from: 0, to: 1, easing: 'out_cubic' }),
      el('anim_btn3_fade', 'panel', { anim_type: 'alpha', duration: 0.4, from: 0, to: 1, easing: 'out_cubic' })
    ], 'welcome_ui')
  },
  {
    id: 'animated_notification', name: 'Notification slide-in', tag: 'Animé', desc: 'Toast notification qui glisse depuis le haut — appuie Lecture',
    thumb: () => tpl_notification_thumb(),
    build: () => root([
      el('notif_bar', 'panel', { size: ['80%', 40], offset: [0, 10], anchor_from: 'top_middle', anchor_to: 'top_middle', color: [0.1, 0.1, 0.12, 0.95], alpha: '@notif_ui.anim_slide' }, [
        el('icon', 'image', { size: [24, 24], offset: [8, 0], texture: 'textures/ui/White', color: [0.3, 0.8, 0.3, 1], anchor_from: 'left_middle', anchor_to: 'left_middle' }),
        el('text', 'label', { text: '§a+50 coins §7— Quête complétée !', size: ['default', 10], offset: [40, 0], anchor_from: 'left_middle', anchor_to: 'left_middle', shadow: true }),
        el('close', 'button', { size: [20, 20], offset: [-8, 0], anchor_from: 'right_middle', anchor_to: 'right_middle', color: [0.3, 0.3, 0.3, 0.5] }, [
          el('x', 'label', { text: '§7✕', size: ['default', 10], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' })
        ])
      ]),
      el('anim_slide', 'panel', { anim_type: 'offset', duration: 0.5, from: [0, -50], to: [0, 0], easing: 'out_cubic' })
    ], 'notif_ui')
  },
  {
    id: 'animated_loading', name: 'Écran de chargement', tag: 'Animé', desc: 'Barre de progression animée avec effet pulse',
    thumb: () => tpl_loading_thumb(),
    build: () => root([
      el('bg', 'panel', { size: ['100%', '100%'], color: [0.03, 0.03, 0.05, 1] }, [
        el('logo', 'label', { text: '§l§6⚡ §fLOADING', size: ['default', 16], offset: [0, -30], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center', shadow: true }),
        el('bar_bg', 'panel', { size: ['60%', 8], offset: [0, 10], anchor_from: 'center', anchor_to: 'center', color: [0.1, 0.1, 0.15, 1] }, [
          el('bar_fill', 'fill', { size: ['100%', '100%'], color: [0.9, 0.4, 0, 1], clip_direction: 'left', clip_ratio: 0.65, anchor_from: 'left_middle', anchor_to: 'left_middle' })
        ]),
        el('percent', 'label', { text: '§765%', size: ['default', 8], offset: [0, 28], anchor_from: 'center', anchor_to: 'center', text_alignment: 'center' }),
        el('tip', 'label', { text: '§8Conseil: Utilisez /help pour les commandes', size: ['default', 7], offset: [0, -16], anchor_from: 'bottom_middle', anchor_to: 'bottom_middle', text_alignment: 'center' })
      ]),
      el('anim_bar', 'panel', { anim_type: 'alpha', duration: 1.2, from: 0.5, to: 1, easing: 'in_out_sine' })
    ], 'loading_ui')
  }
] as Template[];

// ---------- THUMBNAIL HTML (small CSS replicas of templates) ----------
function tpl_empty(): string { return `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5a5a5a;font-size:11px;font-family:'Space Grotesk'">vide</div>`; }
function tpl_neon_sidebar(): string {
  return `<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:60px;height:86px;background:#0d0d0d;border-left:2px solid #ff6b1a;border-radius:2px;padding:6px;font-family:'Space Grotesk';box-shadow:0 0 12px rgba(255,107,26,0.3)">
    <div style="color:#ff6b1a;text-align:center;font-size:8px;font-weight:700">▌ECLIPSE</div>
    <div style="color:#8a8a8a;text-align:center;font-size:6px;margin-top:3px">Rank VIP</div>
    <div style="color:#fff;text-align:center;font-size:6px;margin-top:6px">◆ 14.2k</div>
    <div style="color:#fff;text-align:center;font-size:6px">⚔ 893</div>
  </div>`;
}
function tpl_glass_button(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%">
    <div style="padding:8px 18px;border-radius:5px;background:#ff6b1a;font:700 10px 'Space Grotesk';color:#fff;box-shadow:0 4px 14px rgba(255,107,26,0.4)">▶ JOUER</div>
  </div>`;
}
function tpl_stats_card(): string {
  return `<div style="position:absolute;top:10px;left:10px;width:120px;background:#1a1a1a;border:1px solid #262626;border-radius:4px;overflow:hidden;font-family:'Space Grotesk'">
    <div style="padding:4px 8px;background:#ff6b1a;font:700 7px;color:#fff;letter-spacing:0.1em;text-transform:uppercase">✦ STATS</div>
    <div style="padding:5px 8px;font-size:7px;line-height:1.6;color:#8a8a8a">
      <div>Wins: <span style="color:#fff;font-weight:600">128</span></div>
      <div>Kills: <span style="color:#fff;font-weight:600">1.4k</span></div>
      <div>K/D: <span style="color:#ff6b1a;font-weight:700">2.34</span></div>
    </div>
  </div>`;
}
function tpl_server_list(): string {
  return `<div style="display:flex;flex-direction:column;gap:3px;align-items:center;padding-top:14px;font-family:'Space Grotesk'">
    <div style="font:700 9px;color:#ff6b1a;letter-spacing:0.15em">✦ SERVEURS</div>
    <div style="width:130px;padding:4px 8px;background:#1a1a1a;border:1px solid #ff6b1a;border-radius:3px;font:600 7px;color:#fff">● BedWars · 1234</div>
    <div style="width:130px;padding:4px 8px;background:#1a1a1a;border:1px solid #262626;border-radius:3px;font:600 7px;color:#8a8a8a">● SkyWars · 876</div>
    <div style="width:130px;padding:4px 8px;background:#1a1a1a;border:1px solid #262626;border-radius:3px;font:600 7px;color:#8a8a8a">● Practice · 432</div>
  </div>`;
}
function tpl_hotbar(): string {
  return `<div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);padding:5px 12px;background:#1a1a1a;border:1px solid #ff6b1a;border-radius:3px;font:700 9px 'Space Grotesk';color:#fff;box-shadow:0 0 14px rgba(255,107,26,0.3)">✦ Eclipse ✦</div>`;
}
function tpl_logo(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;flex-direction:column;height:100%;font-family:'Space Grotesk'">
    <div style="font:900 22px;color:#ff6b1a;letter-spacing:3px;text-shadow:0 2px 12px rgba(255,107,26,0.5)">ECLIPSE</div>
    <div style="font:500 7px;color:#8a8a8a;margin-top:4px;letter-spacing:0.2em;text-transform:uppercase">Bedrock network</div>
  </div>`;
}
function tpl_toast(): string {
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
function tpl_shop_grid(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#111;border:1px solid #b8860b;border-radius:3px;padding:4px;width:130px">
      <div style="text-align:center;font:700 8px;color:#b8860b;margin-bottom:3px">SHOP</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px">
        <div style="background:#1a1a1a;padding:3px;text-align:center;font-size:6px;color:#aaa;border-radius:2px">$128</div>
        <div style="background:#1a1a1a;padding:3px;text-align:center;font-size:6px;color:#aaa;border-radius:2px">$256</div>
        <div style="background:#1a1a1a;padding:3px;text-align:center;font-size:6px;color:#aaa;border-radius:2px">$512</div>
        <div style="background:#1a1a1a;padding:3px;text-align:center;font-size:6px;color:#aaa;border-radius:2px">$384</div>
      </div>
    </div>
  </div>`;
}
function tpl_leaderboard(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#111;border:1px solid #b8860b;border-radius:3px;padding:5px;width:120px">
      <div style="text-align:center;font:700 8px;color:#b8860b;margin-bottom:4px">TOP FFA</div>
      <div style="font-size:6px;color:#fff;padding:2px 4px;background:#1a1a1a;border-radius:2px;margin-bottom:1px">#1 Player · 12K</div>
      <div style="font-size:6px;color:#aaa;padding:2px 4px;background:#141414;border-radius:2px;margin-bottom:1px">#2 Player · 9K</div>
      <div style="font-size:6px;color:#888;padding:2px 4px;background:#1a1a1a;border-radius:2px">#3 Player · 5K</div>
    </div>
  </div>`;
}
function tpl_party_menu(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#111;border:1px solid #b8860b;border-radius:3px;padding:5px;width:120px">
      <div style="text-align:center;font:700 8px;color:#b8860b;margin-bottom:4px">PARTY</div>
      <div style="display:flex;gap:3px;justify-content:center">
        <div style="background:#1a1a1a;padding:4px 8px;border-radius:2px;font-size:6px;color:#fff;text-align:center">Create</div>
        <div style="background:#1a1a1a;padding:4px 8px;border-radius:2px;font-size:6px;color:#fff;text-align:center">Invites</div>
      </div>
    </div>
  </div>`;
}
function tpl_color_picker(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#1a1510;border:1px solid #b8860b;border-radius:3px;padding:5px;width:110px">
      <div style="text-align:center;font:700 7px;color:#b8860b;margin-bottom:3px">COLORS</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:4px">
        <div style="width:14px;height:14px;background:#c44;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#4c4;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#44c;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#cc4;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#4cc;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#c4c;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#aaa;border-radius:2px"></div>
        <div style="width:14px;height:14px;background:#555;border-radius:2px"></div>
      </div>
    </div>
  </div>`;
}
function tpl_skill_tree(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#051515;font-family:'Space Grotesk'">
    <div style="position:relative;width:120px;height:80px">
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:24px;height:24px;background:rgba(0,230,200,0.3);border:1px solid #00e6c8;border-radius:3px"></div>
      <div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:18px;height:18px;background:rgba(0,230,200,0.15);border:1px solid rgba(0,230,200,0.4);border-radius:3px"></div>
      <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:18px;height:18px;background:rgba(128,128,128,0.15);border:1px solid rgba(128,128,128,0.3);border-radius:3px"></div>
      <div style="position:absolute;left:50%;top:6px;transform:translateX(-50%);width:18px;height:18px;background:rgba(128,128,128,0.15);border:1px solid rgba(128,128,128,0.3);border-radius:3px"></div>
      <div style="position:absolute;left:50%;top:2px;width:1px;height:18px;background:rgba(128,128,128,0.3);transform:translateX(-50%)"></div>
      <div style="position:absolute;top:50%;left:28px;width:22px;height:1px;background:rgba(0,230,200,0.4);transform:translateY(-50%)"></div>
      <div style="position:absolute;top:50%;right:28px;width:22px;height:1px;background:rgba(128,128,128,0.3);transform:translateY(-50%)"></div>
      <div style="position:absolute;left:4px;top:4px;font:700 7px;color:#00e6c8;letter-spacing:0.1em">SKILL</div>
    </div>
  </div>`;
}
function tpl_casino_menu(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#1a1030;border:1px solid #b8860b;border-radius:3px;padding:4px;width:110px">
      <div style="text-align:center;font:700 7px;color:#e8a820;margin-bottom:3px">CASINO</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px">
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
        <div style="background:#2a9;padding:3px;text-align:center;font-size:6px;color:#fff;border-radius:1px">★</div>
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
        <div style="background:#221838;padding:3px;text-align:center;font-size:6px;color:#444;border-radius:1px">?</div>
      </div>
    </div>
  </div>`;
}
function tpl_spin_wheel(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="text-align:center">
      <div style="font:700 8px;color:#e8a820;margin-bottom:4px">▼ SPIN ▼</div>
      <div style="display:flex;gap:2px;justify-content:center">
        <div style="width:22px;height:22px;background:#1a1a1a;border:1px solid #333;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:10px">🗡</div>
        <div style="width:22px;height:22px;background:#1a1a1a;border:1px solid #333;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:10px">🍎</div>
        <div style="width:22px;height:22px;background:#1a1a1a;border:1px solid #333;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:10px">🦴</div>
        <div style="width:22px;height:22px;background:#1a1a1a;border:1px solid #333;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:10px">🍞</div>
      </div>
      <div style="margin-top:3px;padding:3px 10px;background:#e8a820;border-radius:2px;font:700 7px;color:#fff;display:inline-block">SPIN</div>
    </div>
  </div>`;
}
function tpl_cosmetics_menu(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#111;border:1px solid #b8860b;border-radius:3px;padding:4px;width:130px">
      <div style="text-align:center;font:700 8px;color:#b8860b;margin-bottom:3px">COSMETICS</div>
      <div style="display:flex;gap:3px">
        <div style="width:30px;height:50px;background:#1a1a1a;border:1px solid #333;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:6px;color:#888">SKIN</div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:2px">
          <div style="background:#1a1a1a;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:6px;color:#888">A</div>
          <div style="background:#1a1a1a;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:6px;color:#888">B</div>
          <div style="background:#1a1a1a;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:6px;color:#888">C</div>
          <div style="background:#1a1a1a;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:6px;color:#888">D</div>
        </div>
      </div>
    </div>
  </div>`;
}
function tpl_equipment_select(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0d0d10;font-family:'Space Grotesk'">
    <div style="background:#121218;border:1px solid #555;border-radius:3px;padding:5px;width:120px">
      <div style="text-align:center;font:600 7px;color:#ddd;margin-bottom:3px">Equipment</div>
      <div style="display:flex;gap:2px;justify-content:center">
        <div style="background:#1a1a20;padding:6px 4px;border-radius:2px;text-align:center;font-size:6px;color:#aaa;flex:1">Rifles</div>
        <div style="background:#1a1a20;padding:6px 4px;border-radius:2px;text-align:center;font-size:6px;color:#aaa;flex:1">Pistols</div>
        <div style="background:#1a1a20;padding:6px 4px;border-radius:2px;text-align:center;font-size:6px;color:#aaa;flex:1">Knives</div>
      </div>
    </div>
  </div>`;
}
function tpl_daily_rewards(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#251830;font-family:'Space Grotesk'">
    <div style="display:flex;gap:3px">
      <div style="width:36px;height:48px;background:#b8860b;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
        <div style="font:700 6px;color:#fff">DAILY</div>
        <div style="font-size:14px">📦</div>
      </div>
      <div style="width:36px;height:48px;background:#b8860b;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
        <div style="font:700 5px;color:#fff">MONTHLY</div>
        <div style="font-size:14px">📦</div>
      </div>
      <div style="width:36px;height:48px;background:#b8860b;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
        <div style="font:700 6px;color:#fff">WEEKLY</div>
        <div style="font-size:14px">📦</div>
      </div>
    </div>
  </div>`;
}
function tpl_market_shop(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="display:flex;gap:3px">
      <div style="width:80px">
        <div style="font:700 7px;color:#fff;text-align:center;margin-bottom:2px">MARKET</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px">
          <div style="background:#1a1a1a;height:12px;border-radius:1px"></div>
          <div style="background:#1a1a1a;height:12px;border-radius:1px"></div>
          <div style="background:#1a1a1a;height:12px;border-radius:1px"></div>
          <div style="background:#1a1a1a;height:12px;border-radius:1px"></div>
          <div style="background:#1a1a1a;height:12px;border-radius:1px"></div>
          <div style="background:#1a1a1a;height:12px;border-radius:1px"></div>
        </div>
      </div>
      <div style="width:40px;background:#111;border-radius:2px;padding:3px;font-size:5px;color:#888">
        <div style="text-align:center;margin-bottom:2px">Oak Log</div>
        <div style="padding:2px;background:#1a1;border-radius:1px;text-align:center;color:#fff;font-size:5px;margin-bottom:1px">BUY</div>
        <div style="padding:2px;background:#b81;border-radius:1px;text-align:center;color:#fff;font-size:5px">SELL</div>
      </div>
    </div>
  </div>`;
}
function tpl_friend_add(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0a0a0a;font-family:'Space Grotesk'">
    <div style="background:#111;border:1px solid #b8860b;border-radius:3px;padding:5px;width:100px">
      <div style="text-align:center;font:700 7px;color:#b8860b;margin-bottom:3px">ADD FRIEND</div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:2px;padding:3px;margin-bottom:2px;font-size:6px;color:#555">▼ None</div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:2px;padding:3px;margin-bottom:3px;font-size:6px;color:#555">Player name</div>
      <div style="background:#1a1a1a;border-radius:2px;padding:3px;text-align:center;font:600 6px;color:#5c5">Add Friend</div>
    </div>
  </div>`;
}
function tpl_scoreboard(): string {
  return `<div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);width:70px;padding:4px;background:rgba(10,10,10,0.8);border-radius:2px;font-family:'Space Grotesk'">
    <div style="background:#cc5500;padding:2px;text-align:center;font:700 6px;color:#fff;border-radius:1px;margin-bottom:2px">SERVER</div>
    <div style="font-size:5px;color:#aaa;line-height:1.5;padding:0 2px">
      <div>Online: <span style="color:#fff">24</span></div>
      <div>Kills: <span style="color:#fff">14</span></div>
      <div>Coins: <span style="color:#fff">1.2k</span></div>
    </div>
  </div>`;
}

// ---- Animated template thumbnails ----
function tpl_roulette_thumb(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0d0d0d;font-family:'Space Grotesk'">
    <div style="position:relative;width:80px;height:80px">
      <div style="width:80px;height:80px;border-radius:50%;border:2px solid #ff6b1a;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#1a1a1a,#0d0d0d);animation:spin 3s linear infinite">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px">
          <div style="background:#cc3333;padding:1px 4px;border-radius:2px;font-size:5px;color:#fff;text-align:center">2x</div>
          <div style="background:#33cc33;padding:1px 4px;border-radius:2px;font-size:5px;color:#fff;text-align:center">5x</div>
          <div style="background:#cc9933;padding:1px 4px;border-radius:2px;font-size:5px;color:#fff;text-align:center">10x</div>
          <div style="background:#9933cc;padding:1px 4px;border-radius:2px;font-size:5px;color:#fff;text-align:center">3x</div>
        </div>
      </div>
      <div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);color:#ff6b1a;font-size:10px">▼</div>
    </div>
    <style>@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}</style>
  </div>`;
}
function tpl_welcome_thumb(): string {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:linear-gradient(180deg,#1a0a2e,#0a0a0f);font-family:'Space Grotesk';gap:4px">
    <div style="font:700 10px 'Space Grotesk';color:#a855f7;letter-spacing:0.05em">✦ REALM CRAFT</div>
    <div style="font-size:5px;color:#666">Saison 4</div>
    <div style="background:#6b21a8;padding:2px 14px;border-radius:3px;font-size:6px;color:#fff;margin-top:4px">JOUER</div>
    <div style="background:#1a1a2e;padding:2px 14px;border-radius:3px;font-size:6px;color:#aaa">BOUTIQUE</div>
  </div>`;
}
function tpl_notification_thumb(): string {
  return `<div style="display:flex;align-items:flex-start;justify-content:center;padding-top:8px;height:100%;background:#0d0d0d;font-family:'Space Grotesk'">
    <div style="background:#1a1a1e;border:1px solid #333;border-radius:4px;padding:4px 8px;display:flex;align-items:center;gap:6px;width:120px">
      <div style="width:12px;height:12px;background:#33cc33;border-radius:2px;flex-shrink:0"></div>
      <div style="font-size:5px;color:#ccc">+50 coins — Quête OK</div>
      <div style="font-size:6px;color:#666;margin-left:auto">✕</div>
    </div>
  </div>`;
}
function tpl_loading_thumb(): string {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#0a0a0f;font-family:'Space Grotesk';gap:6px">
    <div style="font:700 8px;color:#ff6b1a">⚡ LOADING</div>
    <div style="width:80px;height:4px;background:#1a1a1a;border-radius:2px;overflow:hidden">
      <div style="width:65%;height:100%;background:linear-gradient(90deg,#ff6b1a,#ff9933);border-radius:2px;animation:pulse 1.5s infinite"></div>
    </div>
    <div style="font-size:5px;color:#555">65%</div>
    <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}</style>
  </div>`;
}


