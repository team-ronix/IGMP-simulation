# IGMP Visualization with Source-Specific Multicast (SSM)

An interactive visualization tool for understanding **Internet Group Management Protocol (IGMP)** with support for **IGMPv3 Source-Specific Multicast (SSM)**.

## Features

### 🎯 Multi-Level Network Topology
- **3 Multicast Sources** - Multiple streaming sources with color-coded packets
- **Multicast Router** - Central router managing IGMP queries and responses
- **Layer 2 Switch** - With optional IGMP Snooping capability
- **5 Hosts** - Each can independently join/leave multicast groups

### ⚡ Source-Specific Multicast (IGMPv3)
- **SSM Mode** - Hosts can filter which sources they receive from
- **Any-Source Multicast (ASM)** - Traditional mode receiving from all sources
- **Fine-Grained Control** - Each host can select specific sources when in SSM mode
- **Real-time Filtering** - Watch packets get filtered based on SSM configuration

### 📡 IGMP Protocol Features
- **General Queries** - Router queries for active group members
- **Membership Reports** - Hosts respond with join messages
- **Leave Messages** - Explicit leave group notifications
- **IGMP Snooping** - Switch learns multicast group membership to optimize forwarding

### 🎨 Visual Packet Animation
- Color-coded packets for different sources (Blue, Green, Orange)
- Real-time packet flow visualization
- Animated paths showing network topology

## Available Scripts

In the project directory, you can run:

### `npm install`

Install all dependencies before first run.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## How to Use the Simulator

### 1. Source Controls
- Click on any source (A, B, or C) to start/stop streaming
- Active sources will show colored indicators and begin sending packets
- Each source has a unique color for easy identification

### 2. Host Configuration
- Click any host to select it and open the configuration panel
- **Join/Leave Group** - Subscribe or unsubscribe from the multicast group
- **Enable SSM Mode** - Activate Source-Specific Multicast (IGMPv3)
- **Select Sources** - When SSM is enabled, choose which sources to receive from

### 3. Router Actions
- **Send General Query** - Router asks all hosts about their group membership
- Hosts will respond if they're members of the multicast group

### 4. Switch Configuration
- **IGMP Snooping Toggle** - Enable/disable intelligent multicast forwarding
  - **ON**: Switch only forwards to subscribed ports (efficient)
  - **OFF**: Switch floods multicast to all ports (broadcast behavior)

## Key Concepts

### Source-Specific Multicast (SSM)
IGMPv3 introduces the ability for hosts to specify which sources they want to receive from, providing better security and reduced bandwidth usage.

### Any-Source Multicast (ASM)
Traditional IGMP where hosts receive from any source sending to the group.

### IGMP Snooping
A Layer 2 optimization where switches learn which ports have interested hosts by snooping on IGMP messages.

