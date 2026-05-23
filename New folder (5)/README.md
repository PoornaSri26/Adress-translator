# Virtual to Physical Address Translation Simulator

An educational simulator demonstrating how modern CPUs perform address translation using hierarchical page tables, Translation Lookaside Buffer (TLB), and page fault handling.

## Features

- **Multi-level page tables**: Supports 1-, 2-, or 3-level hierarchies (e.g., 10/10/12 bits for x86)
- **Address decomposition**: Splits 32-bit virtual addresses into page table indices and offsets
- **TLB simulation**: 4-entry TLB with LRU replacement policy
- **Page table walk**: Step-by-step visualization of each level's traversal
- **Page fault handling**: Simulates loading pages from disk when entries are invalid
- **User-configurable parameters**: Page size, number of levels, and virtual addresses

## Compilation

### Option 1: Using g++ (MinGW or Linux)
```bash
g++ -o address_translator address_translator.cpp
./address_translator
```

### Option 2: Using Visual Studio (cl.exe)
```bash
cl address_translator.cpp
address_translator.exe
```

### Option 3: Online Compiler
- Visit https://www.onlinegdb.com/online_c++_compiler
- Copy the contents of `address_translator.cpp`
- Paste and run

### Option 4: Install MinGW-w64 on Windows
1. Download MinGW-w64 from https://www.mingw-w64.org/
2. Add to PATH
3. Run: `g++ -o address_translator address_translator.cpp`

## Usage

Run the program and use the interactive menu:

```
=== Address Translation Simulator ===
1. Translate a virtual address
2. Configure page size (current: 4096 bytes)
3. Configure number of page table levels (current: 2)
4. View current TLB state
5. Reset page tables and TLB
6. Exit
```

### Example Workflow

1. **Translate an address**: Enter option 1, then input a virtual address like `0x0040A3F2`
2. **Configure page size**: Enter option 2, choose 4096 (4KB), 2097152 (2MB), or 4194304 (4MB)
3. **Configure levels**: Enter option 3, choose 1, 2, or 3 page table levels
4. **View TLB**: Enter option 4 to see current TLB state
5. **Reset**: Enter option 5 to clear all page tables and TLB

## Sample Output

```
--- Address Translation Simulator ---
Page size: 4096 bytes (12 offset bits)
Page table levels: 2 (10 bits VPN1, 10 bits VPN2, 12 bits offset)
TLB size: 4 entries (LRU)

Virtual address: 0x0040A3F2 (binary: 00000000010000001010001111110010)
Split: VPN1 = 0x1 (1), VPN2 = 0x28 (40), offset = 0x3F2 (1010)

TLB lookup (VPN = 0x428) ... MISS

Page table walk:
  Level 1 (page directory) index 1 -> entry: valid=1, next_table=0x2000
  Level 2 (page table) index 40 -> entry: valid=1, frame=0x7A3
Physical frame = 0x7A3
Physical address = (0x7A3 << 12) + 0x3F2 = 0x7A3000 + 0x3F2 = 0x7A33F2

TLB updated: VPN=0x428 -> frame=0x7A3

Final: Virtual 0x0040A3F2 -> Physical 0x7A33F2
```

## How It Works

### Address Decomposition
The virtual address is split into:
- **Page offset**: Lowest bits (determined by page size)
- **VPN indices**: Bits for each page table level

For a 2-level system with 4KB pages:
- 12 bits for page offset (2^12 = 4096)
- 10 bits for first-level VPN
- 10 bits for second-level VPN

### TLB Lookup
1. Extract VPN (virtual page number) from address
2. Search TLB for matching VPN
3. If found (HIT): Return physical frame immediately
4. If not found (MISS): Proceed to page table walk

### Page Table Walk
1. Start with top-level table (page directory)
2. For each level:
   - Use index to fetch PageTableEntry
   - If invalid: Trigger page fault
   - If not last level: Follow next_table pointer
3. At last level: Extract physical frame number

### Page Fault Handling
- Mark entry as valid
- Assign a free physical frame
- Simulate loading from disk

### TLB Update
- Add new VPN→frame mapping
- Use LRU to evict oldest entry if TLB is full

## Data Structures

```cpp
struct PageTableEntry {
    bool valid;           // Present bit
    unsigned int frame;   // Physical frame number
    unsigned int next_table; // Pointer to next-level table
};

struct TLBEntry {
    unsigned int virtual_page;  // Virtual page number
    unsigned int frame;         // Physical frame number
    unsigned int last_used;     // For LRU replacement
};
```

## Educational Value

This simulator helps students understand:
- **Bit-level address manipulation**: How addresses are split and masked
- **Hierarchical data structures**: Multi-level page table organization
- **Hardware acceleration**: Role of TLB in reducing memory accesses
- **Page faults**: What happens when a page is not in memory
- **Replacement policies**: LRU algorithm for TLB management

## Extensions

Potential future enhancements:
- Memory protection bits (read/write/execute)
- Huge pages support (mixing page sizes)
- Inverted page tables
- Swap file simulation
- Graphical address visualization
- Batch mode for processing multiple addresses

## Comparison with Page Replacement Simulator

| Aspect | Page Replacement | Address Translation |
|--------|------------------|---------------------|
| Focus | Which page to evict | How to map virtual→physical |
| Input | Page number sequence | Single virtual address |
| Output | Frame state history | Step-by-step translation |
| Goal | Understand eviction policies | Understand paging hardware |

## Requirements

- C++11 or later
- Standard library only (no external dependencies)
- Works on Windows, Linux, and macOS

## License

Educational project for operating systems courses.
