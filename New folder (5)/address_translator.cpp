#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>
#include <sstream>
#include <bitset>

using namespace std;

const int TLB_SIZE = 4;

struct PageTableEntry {
    bool valid;
    unsigned int frame;
    unsigned int next_table;
    
    PageTableEntry() : valid(false), frame(0), next_table(0) {}
    PageTableEntry(bool v, unsigned int f, unsigned int n) : valid(v), frame(f), next_table(n) {}
};

struct TLBEntry {
    unsigned int virtual_page;
    unsigned int frame;
    unsigned int last_used;
    
    TLBEntry() : virtual_page(0), frame(0), last_used(0) {}
    TLBEntry(unsigned int vp, unsigned int f, unsigned int lu) 
        : virtual_page(vp), frame(f), last_used(lu) {}
};

class AddressTranslator {
private:
    int levels;
    int page_size;
    int offset_bits;
    int vpn_bits_per_level[3];
    vector<PageTableEntry> page_tables[3];
    TLBEntry tlb[TLB_SIZE];
    int tlb_counter;
    unsigned int next_free_frame;
    
public:
    AddressTranslator() : levels(2), page_size(4096), tlb_counter(0), next_free_frame(0) {
        offset_bits = (int)log2(page_size);
        setupDefaultVPNBits();
        initializePageTables();
        initializeTLB();
    }
    
    void setLevels(int l) {
        levels = l;
        setupDefaultVPNBits();
    }
    
    void setPageSize(int ps) {
        page_size = ps;
        offset_bits = (int)log2(page_size);
        setupDefaultVPNBits();
    }
    
    void setupDefaultVPNBits() {
        int remaining_bits = 32 - offset_bits;
        if (levels == 1) {
            vpn_bits_per_level[0] = remaining_bits;
        } else if (levels == 2) {
            vpn_bits_per_level[0] = remaining_bits / 2;
            vpn_bits_per_level[1] = remaining_bits - vpn_bits_per_level[0];
        } else if (levels == 3) {
            vpn_bits_per_level[0] = remaining_bits / 3;
            vpn_bits_per_level[1] = remaining_bits / 3;
            vpn_bits_per_level[2] = remaining_bits - vpn_bits_per_level[0] - vpn_bits_per_level[1];
        }
    }
    
    void initializePageTables() {
        for (int i = 0; i < 3; i++) {
            page_tables[i].clear();
        }
        
        // Create some default page tables for demonstration
        // Level 0: Page directory (typically 1024 entries for 10 bits)
        int level0_entries = 1 << vpn_bits_per_level[0];
        page_tables[0].resize(level0_entries);
        
        // Initialize some entries as valid
        page_tables[0][1] = PageTableEntry(true, 0, 0x2000);  // Points to table at index 0x2000
        page_tables[0][2] = PageTableEntry(true, 0, 0x3000);  // Points to table at index 0x3000
        
        if (levels >= 2) {
            // Level 1: Page tables
            int level1_entries = 1 << vpn_bits_per_level[1];
            
            // Create table at index 0x2000 (simulated as offset in vector)
            for (int i = 0; i < level1_entries; i++) {
                page_tables[1].push_back(PageTableEntry());
            }
            // Set some valid entries
            page_tables[1][0x28] = PageTableEntry(true, 0x7A3, 0);
            page_tables[1][0x40] = PageTableEntry(true, 0x8B4, 0);
            
            // Create table at index 0x3000
            for (int i = 0; i < level1_entries; i++) {
                page_tables[1].push_back(PageTableEntry());
            }
            page_tables[1][0x2000 + 0x50] = PageTableEntry(true, 0x9C5, 0);
        }
        
        if (levels == 3) {
            int level2_entries = 1 << vpn_bits_per_level[2];
            for (int i = 0; i < level2_entries; i++) {
                page_tables[2].push_back(PageTableEntry());
            }
        }
        
        next_free_frame = 0x1000;
    }
    
    void initializeTLB() {
        for (int i = 0; i < TLB_SIZE; i++) {
            tlb[i] = TLBEntry();
        }
        tlb_counter = 0;
    }
    
    void printBinary(unsigned int value, int bits = 32) {
        cout << bitset<32>(value).to_string().substr(32 - bits, bits);
    }
    
    void printConfiguration() {
        cout << "\n--- Address Translation Simulator ---\n";
        cout << "Page size: " << page_size << " bytes (" << offset_bits << " offset bits)\n";
        cout << "Page table levels: " << levels;
        
        if (levels == 1) {
            cout << " (" << vpn_bits_per_level[0] << " bits VPN, " << offset_bits << " bits offset)\n";
        } else if (levels == 2) {
            cout << " (" << vpn_bits_per_level[0] << " bits VPN1, " << vpn_bits_per_level[1] 
                 << " bits VPN2, " << offset_bits << " bits offset)\n";
        } else if (levels == 3) {
            cout << " (" << vpn_bits_per_level[0] << " bits VPN1, " << vpn_bits_per_level[1] 
                 << " bits VPN2, " << vpn_bits_per_level[2] << " bits VPN3, " << offset_bits << " bits offset)\n";
        }
        cout << "TLB size: " << TLB_SIZE << " entries (LRU)\n\n";
    }
    
    void decomposeAddress(unsigned int virtual_addr, unsigned int* vpn_indices, unsigned int& offset) {
        offset = virtual_addr & ((1 << offset_bits) - 1);
        
        unsigned int remaining_vpn = virtual_addr >> offset_bits;
        
        for (int i = levels - 1; i >= 0; i--) {
            vpn_indices[i] = remaining_vpn & ((1 << vpn_bits_per_level[i]) - 1);
            remaining_vpn >>= vpn_bits_per_level[i];
        }
    }
    
    unsigned int calculateVPN(unsigned int* vpn_indices) {
        unsigned int vpn = 0;
        for (int i = 0; i < levels; i++) {
            vpn = (vpn << vpn_bits_per_level[i]) | vpn_indices[i];
        }
        return vpn;
    }
    
    int lookupTLB(unsigned int vpn, unsigned int& frame) {
        int lru_index = 0;
        unsigned int min_last_used = tlb[0].last_used;
        
        for (int i = 0; i < TLB_SIZE; i++) {
            if (tlb[i].virtual_page == vpn && tlb[i].last_used > 0) {
                // TLB hit
                tlb[i].last_used = ++tlb_counter;
                frame = tlb[i].frame;
                return i;
            }
            if (tlb[i].last_used < min_last_used) {
                min_last_used = tlb[i].last_used;
                lru_index = i;
            }
        }
        
        return -1 - lru_index;  // Return negative to indicate miss, encode LRU index
    }
    
    void updateTLB(unsigned int vpn, unsigned int frame) {
        int lru_index = 0;
        unsigned int min_last_used = tlb[0].last_used;
        
        for (int i = 0; i < TLB_SIZE; i++) {
            if (tlb[i].last_used == 0) {
                // Empty slot found
                lru_index = i;
                break;
            }
            if (tlb[i].last_used < min_last_used) {
                min_last_used = tlb[i].last_used;
                lru_index = i;
            }
        }
        
        unsigned int evicted_vpn = tlb[lru_index].virtual_page;
        tlb[lru_index] = TLBEntry(vpn, frame, ++tlb_counter);
        
        if (evicted_vpn != 0) {
            cout << "TLB updated: VPN=0x" << hex << vpn << " -> frame=0x" << frame 
                 << " (LRU evicted entry VPN=0x" << evicted_vpn << ")\n";
        } else {
            cout << "TLB updated: VPN=0x" << hex << vpn << " -> frame=0x" << frame << "\n";
        }
    }
    
    unsigned int pageTableWalk(unsigned int* vpn_indices, bool& page_fault) {
        page_fault = false;
        unsigned int current_table_base = 0;
        
        cout << "Page table walk:\n";
        
        for (int level = 0; level < levels; level++) {
            unsigned int index = vpn_indices[level];
            unsigned int table_index = current_table_base + index;
            
            if (table_index >= page_tables[level].size()) {
                cout << "  Level " << (level + 1) << " index " << dec << index << " -> ";
                cout << "PAGE FAULT (table entry out of bounds)\n";
                page_fault = true;
                return handlePageFault(level, index);
            }
            
            PageTableEntry entry = page_tables[level][table_index];
            
            cout << "  Level " << (level + 1);
            if (level == 0) cout << " (page directory)";
            else if (level == levels - 1) cout << " (page table)";
            else cout << " (page table)";
            cout << " index " << dec << index << " -> entry: valid=" << entry.valid;
            
            if (!entry.valid) {
                cout << ", PAGE FAULT\n";
                page_fault = true;
                return handlePageFault(level, index);
            }
            
            if (level == levels - 1) {
                cout << ", frame=0x" << hex << entry.frame << "\n";
                return entry.frame;
            } else {
                cout << ", next_table=0x" << hex << entry.next_table << "\n";
                current_table_base = entry.next_table;
            }
        }
        
        return 0;
    }
    
    unsigned int handlePageFault(int level, int index) {
        cout << "  Handling page fault: allocating frame 0x" << hex << next_free_frame << "\n";
        
        // Ensure page table is large enough
        unsigned int required_size = index + 1;
        if (page_tables[level].size() < required_size) {
            page_tables[level].resize(required_size);
        }
        
        // Mark entry as valid and assign frame
        if (level == levels - 1) {
            page_tables[level][index] = PageTableEntry(true, next_free_frame, 0);
        } else {
            page_tables[level][index] = PageTableEntry(true, 0, next_free_frame);
        }
        
        unsigned int allocated_frame = next_free_frame;
        next_free_frame += 0x1000;  // Increment to next frame
        
        return allocated_frame;
    }
    
    unsigned int translateAddress(unsigned int virtual_addr) {
        unsigned int vpn_indices[3];
        unsigned int offset;
        
        decomposeAddress(virtual_addr, vpn_indices, offset);
        
        cout << "Virtual address: 0x" << hex << virtual_addr << " (binary: ";
        printBinary(virtual_addr);
        cout << ")\n";
        
        cout << "Split: ";
        for (int i = 0; i < levels; i++) {
            cout << "VPN" << (i + 1) << " = 0x" << hex << vpn_indices[i] << " (" << dec << vpn_indices[i] << ")";
            if (i < levels - 1) cout << ", ";
        }
        cout << ", offset = 0x" << hex << offset << " (" << dec << offset << ")\n";
        
        unsigned int vpn = calculateVPN(vpn_indices);
        
        cout << "\nTLB lookup (VPN = 0x" << hex << vpn << ") ... ";
        
        unsigned int frame;
        int tlb_result = lookupTLB(vpn, frame);
        
        if (tlb_result >= 0) {
            cout << "HIT\n";
            cout << "Physical frame = 0x" << hex << frame << "\n";
            unsigned int physical_addr = (frame << offset_bits) + offset;
            cout << "Physical address = (0x" << hex << frame << " << " << dec << offset_bits << ") + 0x" 
                 << hex << offset << " = 0x" << physical_addr << "\n";
            cout << "\nFinal: Virtual 0x" << hex << virtual_addr << " -> Physical 0x" << physical_addr << "\n";
            return physical_addr;
        }
        
        cout << "MISS\n\n";
        
        bool page_fault;
        frame = pageTableWalk(vpn_indices, page_fault);
        
        if (page_fault) {
            cout << "  Page fault resolved, frame = 0x" << hex << frame << "\n";
        }
        
        cout << "Physical frame = 0x" << hex << frame << "\n";
        unsigned int physical_addr = (frame << offset_bits) + offset;
        cout << "Physical address = (0x" << hex << frame << " << " << dec << offset_bits << ") + 0x" 
             << hex << offset << " = 0x" << hex << (frame << offset_bits) << " + 0x" << offset 
             << " = 0x" << physical_addr << "\n";
        
        updateTLB(vpn, frame);
        
        cout << "\nFinal: Virtual 0x" << hex << virtual_addr << " -> Physical 0x" << physical_addr << "\n";
        
        return physical_addr;
    }
    
    void printTLB() {
        cout << "\nCurrent TLB state:\n";
        for (int i = 0; i < TLB_SIZE; i++) {
            if (tlb[i].last_used > 0) {
                cout << "  Entry " << i << ": VPN=0x" << hex << tlb[i].virtual_page 
                     << ", frame=0x" << tlb[i].frame << ", last_used=" << dec << tlb[i].last_used << "\n";
            } else {
                cout << "  Entry " << i << ": empty\n";
            }
        }
    }
};

unsigned int parseAddress(string input) {
    if (input.substr(0, 2) == "0x" || input.substr(0, 2) == "0X") {
        return stoul(input, nullptr, 16);
    }
    return stoul(input, nullptr, 10);
}

void printMenu() {
    cout << "\n=== Address Translation Simulator ===\n";
    cout << "1. Translate a virtual address\n";
    cout << "2. Configure page size (current: 4096 bytes)\n";
    cout << "3. Configure number of page table levels (current: 2)\n";
    cout << "4. View current TLB state\n";
    cout << "5. Reset page tables and TLB\n";
    cout << "6. Exit\n";
    cout << "Enter your choice: ";
}

int main() {
    AddressTranslator translator;
    
    while (true) {
        translator.printConfiguration();
        printMenu();
        
        int choice;
        cin >> choice;
        
        if (cin.fail()) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid input. Please enter a number.\n";
            continue;
        }
        
        switch (choice) {
            case 1: {
                cout << "Enter virtual address (hex format like 0x0040A3F2 or decimal): ";
                string addr_str;
                cin >> addr_str;
                
                try {
                    unsigned int addr = parseAddress(addr_str);
                    translator.translateAddress(addr);
                } catch (...) {
                    cout << "Invalid address format.\n";
                }
                break;
            }
            case 2: {
                cout << "Enter page size (4096, 2097152 for 2MB, or 4194304 for 4MB): ";
                int ps;
                cin >> ps;
                if (ps == 4096 || ps == 2097152 || ps == 4194304) {
                    translator.setPageSize(ps);
                    cout << "Page size set to " << ps << " bytes.\n";
                } else {
                    cout << "Invalid page size. Using 4096 bytes.\n";
                }
                break;
            }
            case 3: {
                cout << "Enter number of page table levels (1, 2, or 3): ";
                int l;
                cin >> l;
                if (l >= 1 && l <= 3) {
                    translator.setLevels(l);
                    cout << "Page table levels set to " << l << ".\n";
                } else {
                    cout << "Invalid number of levels. Using 2.\n";
                }
                break;
            }
            case 4: {
                translator.printTLB();
                break;
            }
            case 5: {
                translator = AddressTranslator();
                cout << "Page tables and TLB reset.\n";
                break;
            }
            case 6: {
                cout << "Exiting...\n";
                return 0;
            }
            default: {
                cout << "Invalid choice. Please try again.\n";
                break;
            }
        }
        
        cout << "\nPress Enter to continue...";
        cin.ignore();
        cin.get();
    }
    
    return 0;
}
